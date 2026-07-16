/**
 * Task 1.18 — Sprint 1 (VS-1 "Discovery Workspace") end-to-end
 * vertical-slice demonstration. Unlike `tools/sprint0-demo` (a single
 * in-process script composing adapters directly), VS-1's real components
 * are three actual running HTTP services (`apps/api-gateway`,
 * `apps/orchestrator`, and `apps/web`) — so this script spawns the real
 * built `api-gateway`/`orchestrator` processes (`dist/main.js`, the same
 * artifact a real deployment runs) and drives them over real HTTP, exactly
 * as a browser client would: login → submit an idea → answer real
 * clarifications the `requirements-analyst` agent raises → approve →
 * `Project` created. No fakes/mocks anywhere in the request path.
 *
 * Requires `infra/docker-compose` running (`pnpm run infra:up`) and the
 * monorepo built (`pnpm run build`).
 *
 * Real Anthropic access is required and NOT faked: this run is gated on
 * `SAF_TEST_ANTHROPIC_API_KEY` (the same convention `adapter-llm-anthropic`'s
 * own integration tests use) and exits cleanly, printing why, if it's unset
 * — never substitutes a fabricated key or a canned LLM response.
 *
 * "Authenticate" reuses the same dev-only Resource Owner Password (Direct
 * Grant) mechanism `tools/sprint0-demo` uses — a real Authorization Code
 * needs a browser this environment doesn't have (documented Sprint 0/1
 * limitation). `apps/web`'s actual screens are exercised by hand/browser
 * separately; this script proves the same real HTTP chain they call into.
 */
import { randomUUID } from "node:crypto";
import { type ChildProcess, spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as client from "openid-client";
import {
  createAccessTokenValidator,
  createOidcClient,
  sealSession,
} from "@sap-app-factory/auth-core";
import {
  correlationFromRequestContext,
  createLogger,
  getTracer,
  startTracing,
  withSpan,
} from "@sap-app-factory/observability";
import type { RequestContext } from "@sap-app-factory/ports";

const testAnthropicApiKey = process.env.SAF_TEST_ANTHROPIC_API_KEY;

if (!testAnthropicApiKey) {
  console.log(
    "SAF_TEST_ANTHROPIC_API_KEY is not set — skipping the Sprint 1 vertical-slice demo.\n" +
      "This demo drives apps/orchestrator's real structure-business-requirement capability\n" +
      "against the real Anthropic API; it never substitutes a fabricated key or canned\n" +
      "response. Set SAF_TEST_ANTHROPIC_API_KEY to a real Anthropic API key to run it.",
  );
  process.exit(0);
}

const KEYCLOAK_ISSUER_URL =
  process.env.SAF_KEYCLOAK_ISSUER_URL ?? "http://localhost:8080/realms/sap-app-factory";
const OTEL_EXPORTER_URL = process.env.SAF_OTEL_EXPORTER_URL ?? "http://localhost:4318";
const OPA_URL = process.env.SAF_OPA_URL ?? "http://localhost:8181";
const POSTGRES_ADMIN_URL =
  process.env.SAF_POSTGRES_ADMIN_URL ??
  "postgres://saf:saf_dev_password@localhost:55432/sap_app_factory";
const POSTGRES_APP_URL =
  process.env.SAF_POSTGRES_APP_URL ??
  "postgres://saf_app:saf_app_dev_password@localhost:55432/sap_app_factory";

// Distinct, high ports for the demo's own spawned processes — avoids
// colliding with a developer's own `pnpm dev` instances on the standard
// 3001/3002 ports.
const API_GATEWAY_PORT = Number(process.env.SAF_DEMO_API_GATEWAY_PORT ?? 14001);
const ORCHESTRATOR_PORT = Number(process.env.SAF_DEMO_ORCHESTRATOR_PORT ?? 14002);
const API_GATEWAY_URL = `http://localhost:${API_GATEWAY_PORT}`;
const ORCHESTRATOR_URL = `http://localhost:${ORCHESTRATOR_PORT}`;
const SESSION_SECRET = "sprint1-demo-session-secret";

// Same dev-only test client/user as auth-core's test-support.ts and
// tools/sprint0-demo — Direct Grant is enabled on this client only for this
// purpose (see infra/docker-compose/keycloak-import/sap-app-factory-realm.json).
const TEST_CLIENT_ID = "sap-app-factory-api-gateway";
const TEST_CLIENT_SECRET = "dev-only-client-secret";
const TEST_USERNAME = "dev-user";
const TEST_PASSWORD = "dev-user-password";

const MAX_CLARIFICATION_ROUNDS = 4;
const IDEA_TEXT =
  "We need a way for warehouse staff to reconcile physical stock counts against SAP " +
  "inventory records at the end of each shift, and flag discrepancies over a threshold.";
const GENERIC_CLARIFICATION_ANSWER =
  "Use reasonable default assumptions for this demo scenario; no additional constraints.";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const APPS_DIR = resolve(SCRIPT_DIR, "../../../apps");

const tracing = startTracing({
  serviceName: "sprint1-vertical-slice-demo",
  otlpEndpoint: OTEL_EXPORTER_URL,
});
const tracer = getTracer("sprint1-vertical-slice-demo");
const logger = createLogger("sprint1-vertical-slice-demo");

function step(n: number, title: string): void {
  console.log(`\n[${n}] ${title}`);
}

function spawnApp(name: string, scriptPath: string, env: Record<string, string>): ChildProcess {
  const child = spawn(process.execPath, [scriptPath], {
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout?.on("data", (chunk: Buffer) =>
    process.stdout.write(`    [${name}] ${chunk.toString()}`),
  );
  child.stderr?.on("data", (chunk: Buffer) =>
    process.stderr.write(`    [${name}] ${chunk.toString()}`),
  );
  return child;
}

async function waitForHealth(baseUrl: string, name: string, attempts = 50): Promise<void> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(`${baseUrl}/health`);
      if (response.ok) {
        return;
      }
    } catch {
      // not up yet — retry
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`${name} did not become healthy within ${attempts * 200}ms`);
}

interface DiscoveryDocument {
  readonly id: string;
  readonly status: string;
  readonly suggestedProjectName: string;
}
interface AcceptanceCriterion {
  readonly description: string;
  readonly origin: string;
}
interface Requirement {
  readonly id: string;
  readonly kind: string;
  readonly description: string;
  readonly acceptanceCriteria?: readonly AcceptanceCriterion[];
}
interface Clarification {
  readonly id: string;
  readonly question: string;
}
interface DiscoverySessionResponse {
  readonly runId?: string;
  readonly document: DiscoveryDocument;
  readonly requirements?: readonly Requirement[];
  readonly unansweredClarifications: readonly Clarification[];
}

interface ConfirmDiscoveryResponse {
  readonly project: { readonly id: string; readonly name: string };
}

async function postJson<T>(cookie: string, path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_GATEWAY_URL}${path}`, {
    method: "POST",
    headers: { "content-type": "application/json", cookie },
    body: JSON.stringify(body),
  });
  const parsed: unknown = await response.json();
  if (!response.ok) {
    throw new Error(`${path} failed (${response.status}): ${JSON.stringify(parsed)}`);
  }
  return parsed as T;
}

async function main(): Promise<void> {
  const correlationId = randomUUID();
  let apiGateway: ChildProcess | undefined;
  let orchestrator: ChildProcess | undefined;

  try {
    await withSpan(tracer, "sprint1.vertical-slice", { correlationId }, async () => {
      step(1, "Start the real apps/orchestrator and apps/api-gateway processes");
      orchestrator = spawnApp("orchestrator", resolve(APPS_DIR, "orchestrator/dist/main.js"), {
        SAF_ORCHESTRATOR_PORT: String(ORCHESTRATOR_PORT),
        SAF_OPA_URL: OPA_URL,
        SAF_POSTGRES_ADMIN_URL: POSTGRES_ADMIN_URL,
        SAF_POSTGRES_APP_URL: POSTGRES_APP_URL,
        SAF_OTEL_EXPORTER_URL: OTEL_EXPORTER_URL,
        ANTHROPIC_API_KEY: testAnthropicApiKey!,
      });
      apiGateway = spawnApp("api-gateway", resolve(APPS_DIR, "api-gateway/dist/main.js"), {
        SAF_API_GATEWAY_PORT: String(API_GATEWAY_PORT),
        SAF_ORCHESTRATOR_URL: ORCHESTRATOR_URL,
        SAF_KEYCLOAK_ISSUER_URL: KEYCLOAK_ISSUER_URL,
        SAF_OPA_URL: OPA_URL,
        SAF_SESSION_SECRET: SESSION_SECRET,
        SAF_OTEL_EXPORTER_URL: OTEL_EXPORTER_URL,
      });
      await Promise.all([
        waitForHealth(ORCHESTRATOR_URL, "orchestrator"),
        waitForHealth(API_GATEWAY_URL, "api-gateway"),
      ]);
      console.log("    both services healthy");

      step(2, "Authenticate against real Keycloak (Direct Grant — same as tools/sprint0-demo)");
      const oidcConfig = await createOidcClient({
        issuerUrl: KEYCLOAK_ISSUER_URL,
        clientId: TEST_CLIENT_ID,
        clientSecret: TEST_CLIENT_SECRET,
      });
      const tokens = await client.genericGrantRequest(oidcConfig, "password", {
        username: TEST_USERNAME,
        password: TEST_PASSWORD,
        scope: "openid",
      });
      const validateAccessToken = createAccessTokenValidator(oidcConfig);
      const claims = await validateAccessToken(tokens.access_token);
      const tenantId = typeof claims.tenant_id === "string" ? claims.tenant_id : "default-tenant";
      const actorId = typeof claims.sub === "string" ? claims.sub : "unknown-actor";
      const sealed = sealSession(
        { tenantId, actorId, expiresAt: Date.now() + 15 * 60 * 1000 },
        SESSION_SECRET,
      );
      const cookie = `saf_session=${sealed}`;
      console.log(
        `    real signed token validated, sealed session cookie: ${sealed.slice(0, 24)}...`,
      );

      const ctx: RequestContext = { tenantId, actorId, correlationId, tenancyTier: "pooled" };
      logger.info("authenticated", correlationFromRequestContext(ctx));

      step(3, "Submit a business idea (POST /discovery/start via api-gateway → orchestrator)");
      let state = await postJson<DiscoverySessionResponse>(cookie, "/discovery/start", {
        workspaceId: "default-workspace",
        ideaText: IDEA_TEXT,
      });
      const runId = state.runId;
      if (!runId) {
        throw new Error("/discovery/start did not return a runId");
      }
      console.log(`    RequirementDocument ${state.document.id} created, run ${runId} started`);

      step(4, "Resolve the clarification loop with real answers to the real agent's questions");
      let round = 1;
      while (state.unansweredClarifications.length > 0) {
        if (round > MAX_CLARIFICATION_ROUNDS) {
          throw new Error(
            `Clarification loop did not resolve within ${MAX_CLARIFICATION_ROUNDS} rounds`,
          );
        }
        console.log(
          `    round ${round}: answering ${state.unansweredClarifications.length} clarification(s)`,
        );
        for (const clarification of state.unansweredClarifications) {
          console.log(`      Q: ${clarification.question}`);
          state = await postJson<DiscoverySessionResponse>(
            cookie,
            "/discovery/answer-clarification",
            {
              runId,
              requirementDocumentId: state.document.id,
              clarificationId: clarification.id,
              answer: GENERIC_CLARIFICATION_ANSWER,
              round,
            },
          );
        }
        round += 1;
      }
      console.log(
        `    no unanswered clarifications remain (${state.requirements?.length ?? 0} requirement(s))`,
      );
      for (const requirement of state.requirements ?? []) {
        console.log(`      [${requirement.kind}] ${requirement.description}`);
      }

      step(5, "Approve the Project Charter (POST /discovery/confirm)");
      const confirmed = await postJson<ConfirmDiscoveryResponse>(cookie, "/discovery/confirm", {
        runId,
        requirementDocumentId: state.document.id,
      });
      const { project } = confirmed;
      console.log(`    Project ${project.id} created: "${project.name}"`);

      step(6, "Correlated telemetry");
      const telemetrySpan = tracer.startSpan("sprint1.telemetry-check");
      const traceId = telemetrySpan.spanContext().traceId;
      telemetrySpan.end();
      console.log(`    correlationId=${correlationId}`);
      console.log(`    traceId=${traceId}`);
      logger.info("vertical slice completed", correlationFromRequestContext(ctx), {
        tenantId,
        requirementDocumentId: state.document.id,
        runId,
        projectId: project.id,
      });
    });

    console.log("\nSprint 1 vertical-slice demo completed successfully.");
  } finally {
    orchestrator?.kill();
    apiGateway?.kill();
    await tracing.shutdown();
  }
}

await main();

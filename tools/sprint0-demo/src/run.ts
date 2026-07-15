/**
 * SAF-21 — Sprint 0 end-to-end vertical-slice demonstration. Drives the
 * minimum agreed scenario through real, already-built components — no
 * fakes/mocks, and no real SAP/BTP/LLM/MCP integrations (none exist yet,
 * none are needed): authenticate → create a tenant, persist tenant-scoped
 * data → create a project → publish an event, process it → execute a
 * capability through the workflow engine → invoke the example plugin →
 * create an artifact → record an audit event → generate correlated
 * telemetry.
 *
 * Requires `infra/docker-compose` running (`pnpm run infra:up`) — this
 * package's own dependencies are real workspace packages, resolved through
 * `dist/` exactly like any real app's composition root; nothing here is a
 * fake standing in for a future implementation.
 *
 * "Authenticate" reuses the same dev-only Resource Owner Password (Direct
 * Grant) mechanism `auth-core`'s own test suite uses (see its
 * `test-support.ts`) — real Keycloak, a real signed token, real signature
 * validation — since a real Authorization Code needs a browser this
 * environment doesn't have (the same documented Sprint 0 limitation
 * `auth-core`'s and `api-gateway`'s READMEs already state). Not imported
 * from `test-support.ts` directly: that file is deliberately excluded from
 * `auth-core`'s own build and never exported, so this mirrors its ~10 lines
 * instead of reaching into another package's internals.
 */
import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import * as client from "openid-client";
import { Pool } from "pg";
import {
  createAccessTokenValidator,
  createOidcClient,
  sealSession,
} from "@sap-app-factory/auth-core";
import { createPostgresOutboxEventBus } from "@sap-app-factory/adapter-events-postgres-outbox";
import { InMemoryWorkflowEngineAdapter } from "@sap-app-factory/adapter-workflow-engine-in-memory";
import {
  defineCapability,
  registerCapabilityProvider,
  resolveCapabilityProvider,
} from "@sap-app-factory/context-capability-registry";
import { createArtifact } from "@sap-app-factory/context-generation";
import { recordAuditEvent } from "@sap-app-factory/context-governance";
import { createTenant } from "@sap-app-factory/context-identity";
import { createWorkspace } from "@sap-app-factory/context-project";
import { createEnvelope } from "@sap-app-factory/events-core";
import {
  correlationFromRequestContext,
  createLogger,
  getTracer,
  startTracing,
  withSpan,
} from "@sap-app-factory/observability";
import { AuditEventRepository } from "@sap-app-factory/persistence-postgres-governance";
import { TenantRepository } from "@sap-app-factory/persistence-postgres-identity";
import { FioriGeneratorPlugin } from "@sap-app-factory/plugin-fiori-generator";
import { execute } from "@sap-app-factory/plugin-sdk";
import type { RequestContext } from "@sap-app-factory/ports";

const KEYCLOAK_ISSUER_URL =
  process.env.SAF_KEYCLOAK_ISSUER_URL ?? "http://localhost:8080/realms/sap-app-factory";
const OTEL_EXPORTER_URL = process.env.SAF_OTEL_EXPORTER_URL ?? "http://localhost:4318";
const ADMIN_POSTGRES_URL =
  process.env.SAF_POSTGRES_ADMIN_URL ??
  "postgres://saf:saf_dev_password@localhost:55432/sap_app_factory";
const APP_POSTGRES_URL =
  process.env.SAF_POSTGRES_APP_URL ??
  "postgres://saf_app:saf_app_dev_password@localhost:55432/sap_app_factory";

// Same dev-only test client/user as auth-core's test-support.ts — Direct
// Grant is enabled on this client only for this purpose (see
// infra/docker-compose/keycloak-import/sap-app-factory-realm.json).
const TEST_CLIENT_ID = "sap-app-factory-api-gateway";
const TEST_CLIENT_SECRET = "dev-only-client-secret";
const TEST_USERNAME = "dev-user";
const TEST_PASSWORD = "dev-user-password";

// migrate()'s migrationsFolder resolves relative to process.cwd(), never to
// the importing module's own location — found by hand, since this script is
// meant to be run from this package's directory (via `pnpm --filter
// @sap-app-factory/sprint0-demo run demo`), where "./migrations" would
// silently resolve to a nonexistent path. Computed as absolute paths
// instead, relative to this file.
const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const IDENTITY_MIGRATIONS_DIR = resolve(
  SCRIPT_DIR,
  "../../../packages/persistence-postgres/identity/migrations",
);
const GOVERNANCE_MIGRATIONS_DIR = resolve(
  SCRIPT_DIR,
  "../../../packages/persistence-postgres/governance/migrations",
);

const tracing = startTracing({
  serviceName: "sprint0-vertical-slice-demo",
  otlpEndpoint: OTEL_EXPORTER_URL,
});
const tracer = getTracer("sprint0-vertical-slice-demo");
const logger = createLogger("sprint0-vertical-slice-demo");

function step(n: number, title: string): void {
  console.log(`\n[${n}] ${title}`);
}

async function main(): Promise<void> {
  const correlationId = randomUUID();
  const adminPool = new Pool({ connectionString: ADMIN_POSTGRES_URL });
  const appPool = new Pool({ connectionString: APP_POSTGRES_URL });

  console.log("[0] Applying identity/governance migrations (idempotent — safe to run repeatedly)");
  // Distinct migrationsTable per package — the real cross-package migration-
  // tracking bug found and fixed in SAF-15: drizzle-orm's shared, unscoped
  // default table makes the second package's migrate() call wrongly think
  // its own migrations are already applied.
  await migrate(drizzle(adminPool), {
    migrationsFolder: IDENTITY_MIGRATIONS_DIR,
    migrationsTable: "identity_migrations",
  });
  await migrate(drizzle(adminPool), {
    migrationsFolder: GOVERNANCE_MIGRATIONS_DIR,
    migrationsTable: "governance_migrations",
  });

  const { eventBus, stop: stopEventBus } = await createPostgresOutboxEventBus({
    adminConnectionString: ADMIN_POSTGRES_URL,
    appConnectionString: APP_POSTGRES_URL,
  });

  try {
    await withSpan(tracer, "sprint0.vertical-slice", { correlationId }, async () => {
      // 1. Authenticate — real Keycloak, real signed token, real validation.
      step(1, "Authenticate against real Keycloak");
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
        "demo-session-secret",
      );
      console.log(
        `    real signed token validated, sealed session cookie: ${sealed.slice(0, 24)}...`,
      );

      const ctx: RequestContext = { tenantId, actorId, correlationId, tenancyTier: "pooled" };
      logger.info("authenticated", correlationFromRequestContext(ctx));

      // 2. Create + persist tenant-scoped data — real Postgres, real RLS.
      step(2, "Create and persist a Tenant (real Postgres, RLS-scoped)");
      const tenant = createTenant({ id: `tenant-${randomUUID()}`, name: "Sprint 0 Demo Tenant" });
      const tenantRepository = new TenantRepository(appPool);
      await tenantRepository.save(ctx, tenant);
      const roundTripped = await tenantRepository.findById(ctx, tenant.id);
      if (!roundTripped) {
        throw new Error("Tenant did not round-trip through Postgres");
      }
      console.log(`    persisted and re-read Tenant ${roundTripped.id} (${roundTripped.name})`);

      // 3. Create a project (context-project's Workspace — in-memory only;
      // no persistence-postgres/project package exists yet, same documented
      // Sprint 0 gap as Risk).
      step(3, "Create a project (Workspace domain aggregate)");
      const workspace = createWorkspace({
        id: `workspace-${randomUUID()}`,
        tenantId,
        name: "Sprint 0 Demo Project",
      });
      console.log(`    created Workspace ${workspace.id} (status: ${workspace.status})`);

      // 4. Publish + process an event — real transactional outbox, real
      // LISTEN/NOTIFY relay.
      step(4, "Publish a domain event and process it via a real subscriber");
      const processed = new Promise<void>((promiseResolve, promiseReject) => {
        const timer = setTimeout(
          () => promiseReject(new Error("event was not processed within 10s")),
          10_000,
        );
        eventBus.subscribe("workspace.created.v1", async (event) => {
          clearTimeout(timer);
          console.log(
            `    subscriber received ${event.type} for workspace ${(event.data as { workspaceId: string }).workspaceId}`,
          );
          promiseResolve();
        });
      });
      await eventBus.publish(
        ctx,
        createEnvelope(ctx, {
          type: "workspace.created.v1",
          source: "sprint0-vertical-slice-demo",
          dataVersion: 1,
          data: { workspaceId: workspace.id, tenantId },
        }),
      );
      await processed;

      // 5. Execute a capability through the workflow engine, invoking the
      // example plugin as that capability's resolved provider.
      step(5, "Execute a capability through the workflow engine");
      const workflowEngine = new InMemoryWorkflowEngineAdapter(eventBus, { stepsPerRun: 1 });
      const plugin = new FioriGeneratorPlugin();
      const capability = defineCapability({
        id: "generate-fiori-elements-app",
        name: "Generate Fiori Elements App",
        expectedArtifactTypes: ["fiori-elements-app"],
      });
      const provider = registerCapabilityProvider({
        id: `${plugin.manifest.id}-provides-${capability.id}`,
        capabilityId: capability.id,
        providerType: "plugin",
        providerId: plugin.manifest.id,
        providerVersion: plugin.manifest.version,
        priority: 1,
      });
      const resolvedProvider = resolveCapabilityProvider([provider]);
      console.log(
        `    capability "${capability.id}" resolved to provider "${resolvedProvider.providerId}"`,
      );

      const runId = await workflowEngine.startRun(ctx, "demo-workflow-definition", {
        requirementRefs: [],
        parameters: {},
      });
      console.log(`    workflow run ${runId} started`);

      // 6. Invoke the example plugin (the resolved capability provider).
      step(6, "Invoke the example plugin via plugin-sdk's execute() seam");
      const artifacts = await execute(plugin, ctx, {
        requirementRefs: [],
        targetEnvironmentRef: "dev",
        targetExecutionProfile: "local-poc",
        parameters: {},
      });
      console.log(`    plugin produced ${artifacts.length} GeneratedArtifact(s)`);

      const runStatus = await workflowEngine.advance(ctx, runId, {
        stepId: `invoke-${resolvedProvider.providerId}`,
        output: { artifactCount: artifacts.length },
        succeeded: true,
      });
      console.log(`    workflow run ${runId} status: ${runStatus}`);

      // 7. Create an artifact — converts the plugin's GeneratedArtifact DTO
      // into a real Artifact domain object (no persistence-postgres/
      // generation package exists yet to actually persist it — same
      // documented gap as Workspace/Risk).
      step(7, "Create a real Artifact from the plugin's GeneratedArtifact");
      const generated = artifacts[0];
      if (!generated) {
        throw new Error("Plugin produced no artifacts to convert");
      }
      const artifact = createArtifact({
        id: `artifact-${randomUUID()}`,
        artifactType: generated.artifactType,
        storageRef: `local://sprint0-demo/${randomUUID()}`,
      });
      console.log(
        `    created Artifact ${artifact.id} (type: ${artifact.artifactType}, status: ${artifact.status})`,
      );

      // 8. Record an audit event — real Postgres, real partitioned table.
      step(8, "Record an audit event (real Postgres, partitioned table)");
      const auditEvent = recordAuditEvent({
        id: `audit-${randomUUID()}`,
        tenantId,
        actorId,
        action: "sprint0.vertical-slice.completed",
        occurredAt: new Date().toISOString(),
      });
      const auditEventRepository = new AuditEventRepository(appPool);
      await auditEventRepository.save(ctx, auditEvent);
      const auditRoundTripped = await auditEventRepository.findById(ctx, auditEvent.id);
      if (!auditRoundTripped) {
        throw new Error("AuditEvent did not round-trip through Postgres");
      }
      console.log(
        `    persisted and re-read AuditEvent ${auditRoundTripped.id} (${auditRoundTripped.action})`,
      );

      // 9. Generate correlated telemetry — every step above ran inside this
      // one root span; every logger.info() call carries the same
      // correlationId. Report both so they can be grepped in the OTel
      // Collector's debug exporter output.
      step(9, "Correlated telemetry");
      const telemetrySpan = tracer.startSpan("sprint0.telemetry-check");
      const traceId = telemetrySpan.spanContext().traceId;
      telemetrySpan.end();
      console.log(`    correlationId=${correlationId}`);
      console.log(`    traceId=${traceId}`);
      logger.info("vertical slice completed", correlationFromRequestContext(ctx), {
        tenantId,
        workspaceId: workspace.id,
        runId,
        artifactId: artifact.id,
        auditEventId: auditEvent.id,
      });
    });

    console.log("\nSprint 0 vertical-slice demo completed successfully.");
  } finally {
    await stopEventBus();
    await adminPool.end();
    await appPool.end();
    await tracing.shutdown();
  }
}

await main();

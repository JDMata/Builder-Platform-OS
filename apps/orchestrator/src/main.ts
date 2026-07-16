import { randomUUID } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createPostgresOutboxEventBus } from "@sap-app-factory/adapter-events-postgres-outbox";
import { EnvSecretsVaultAdapter } from "@sap-app-factory/adapter-secrets-vault-env";
import { createProjectFromCapturedRequirements } from "@sap-app-factory/context-project";
import type { CapturedRequirementsEventData } from "@sap-app-factory/context-project";
import { createLogger, startTracing } from "@sap-app-factory/observability";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { deterministicProjectId } from "./discovery-workflow.js";
import { buildDependencies } from "./build-dependencies.js";
import { createServer } from "./server.js";

const port = Number(process.env.SAF_ORCHESTRATOR_PORT ?? 3002);
const logger = createLogger("orchestrator");

const tracing = startTracing({
  serviceName: "orchestrator",
  otlpEndpoint: process.env.SAF_OTEL_EXPORTER_URL ?? "http://localhost:4318",
});

const { eventBus, stop } = await createPostgresOutboxEventBus();

// Process-startup secret resolution — the one place this process touches
// SecretsVaultPort directly, same discipline as `process.env` above. See
// adapter-secrets-vault-env's README for why the dev-only .env-default
// adapter remains sufficient for Sprint 1 (VS-1 Readiness Review).
const secretsVault = new EnvSecretsVaultAdapter();
const systemCtx = {
  tenantId: "system",
  actorId: "system",
  correlationId: randomUUID(),
  tenancyTier: "pooled" as const,
};
const anthropicApiKey = await secretsVault.getSecret(systemCtx, { name: "ANTHROPIC_API_KEY" });

// VS-1's new persistence — idempotent migrations at startup, same
// low-friction-local-dev convention tools/sprint0-demo already established
// (real production deploys run `db:migrate` as its own release step, not
// on every process boot; this matches the same pnpm-run-dev friction goal).
const postgresUrl =
  process.env.SAF_POSTGRES_ADMIN_URL ??
  "postgres://saf:saf_dev_password@localhost:55432/sap_app_factory";
const appPostgresUrl =
  process.env.SAF_POSTGRES_APP_URL ??
  "postgres://saf_app:saf_app_dev_password@localhost:55432/sap_app_factory";

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const adminPool = new Pool({ connectionString: postgresUrl });
await migrate(drizzle(adminPool), {
  migrationsFolder: resolve(
    SCRIPT_DIR,
    "../../../packages/persistence-postgres/requirements/migrations",
  ),
  migrationsTable: "requirements_migrations",
});
await migrate(drizzle(adminPool), {
  migrationsFolder: resolve(
    SCRIPT_DIR,
    "../../../packages/persistence-postgres/project/migrations",
  ),
  migrationsTable: "project_migrations",
});
await adminPool.end();

const appPool = new Pool({ connectionString: appPostgresUrl });

const deps = buildDependencies(eventBus, anthropicApiKey, appPool);

// The real cross-context event subscriber (ADR-0007) — context-project's
// Project is created here, from requirements.document.captured.v1's data,
// never called directly by context-requirements' application layer. Uses
// a deterministic id so discovery-workflow.ts's caller can look the
// created Project up without a separate correlation registry.
eventBus.subscribe("requirements.document.captured.v1", async (event) => {
  const data = event.data as CapturedRequirementsEventData;
  const ctx = {
    tenantId: event.tenantId,
    actorId: "system",
    correlationId: event.correlationId,
    tenancyTier: "pooled" as const,
  };
  await createProjectFromCapturedRequirements(ctx, { projects: deps.projects }, data, () =>
    deterministicProjectId(data.requirementDocumentId),
  );
});

// Process-startup log line, not request-scoped — no real request exists yet
// to carry a correlationId, so one is generated for this one line.
logger.info(
  "orchestrator started",
  { correlationId: randomUUID() },
  { plugins: deps.plugins.map((plugin) => plugin.manifest.id) },
);
const server = createServer(deps);
server.listen(port);

process.on("SIGTERM", () => {
  server.close();
  void appPool.end();
  void stop();
  void tracing.shutdown();
});
process.on("SIGINT", () => {
  server.close();
  void appPool.end();
  void stop();
  void tracing.shutdown();
});

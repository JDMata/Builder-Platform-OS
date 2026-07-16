import { randomUUID } from "node:crypto";
import { createPostgresOutboxEventBus } from "@sap-app-factory/adapter-events-postgres-outbox";
import { EnvSecretsVaultAdapter } from "@sap-app-factory/adapter-secrets-vault-env";
import { createLogger, startTracing } from "@sap-app-factory/observability";
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

const deps = buildDependencies(eventBus, anthropicApiKey);
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
  void stop();
  void tracing.shutdown();
});
process.on("SIGINT", () => {
  server.close();
  void stop();
  void tracing.shutdown();
});

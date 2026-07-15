import { randomUUID } from "node:crypto";
import { createPostgresOutboxEventBus } from "@sap-app-factory/adapter-events-postgres-outbox";
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

const deps = buildDependencies(eventBus);
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

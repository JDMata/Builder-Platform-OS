import { createPostgresOutboxEventBus } from "@sap-app-factory/adapter-events-postgres-outbox";
import { startTracing } from "@sap-app-factory/observability";
import { buildDependencies } from "./build-dependencies.js";
import { createServer } from "./server.js";

const port = Number(process.env.SAF_WORKER_PORT ?? 3003);

const tracing = startTracing({
  serviceName: "worker",
  otlpEndpoint: process.env.SAF_OTEL_EXPORTER_URL ?? "http://localhost:4318",
});

const { eventBus, stop } = await createPostgresOutboxEventBus();

const deps = buildDependencies(eventBus);
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

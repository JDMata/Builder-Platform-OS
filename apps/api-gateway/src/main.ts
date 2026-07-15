import { startTracing } from "@sap-app-factory/observability";
import { buildDependencies } from "./build-dependencies.js";
import { createServer } from "./server.js";

const port = Number(process.env.SAF_API_GATEWAY_PORT ?? 3001);

// Started first, before anything else, per ADR-0012 — every span created
// anywhere in this process (server.ts, auth-routes.ts) resolves against the
// provider registered here.
const tracing = startTracing({
  serviceName: "api-gateway",
  otlpEndpoint: process.env.SAF_OTEL_EXPORTER_URL ?? "http://localhost:4318",
});

const deps = await buildDependencies();
const server = createServer(deps);
server.listen(port);

process.on("SIGTERM", () => {
  server.close();
  void tracing.shutdown();
});
process.on("SIGINT", () => {
  server.close();
  void tracing.shutdown();
});

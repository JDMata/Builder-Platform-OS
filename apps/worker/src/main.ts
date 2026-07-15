import { createPostgresOutboxEventBus } from "@sap-app-factory/adapter-events-postgres-outbox";
import { buildDependencies } from "./build-dependencies.js";
import { createServer } from "./server.js";

const port = Number(process.env.SAF_WORKER_PORT ?? 3003);

const { eventBus, stop } = await createPostgresOutboxEventBus();

const deps = buildDependencies(eventBus);
const server = createServer(deps);
server.listen(port);

process.on("SIGTERM", () => {
  server.close();
  void stop();
});
process.on("SIGINT", () => {
  server.close();
  void stop();
});

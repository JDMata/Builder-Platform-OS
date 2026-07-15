import { Pool } from "pg";
import { PostgresOutboxAdapter } from "@sap-app-factory/adapter-events-postgres-outbox";
import { buildDependencies } from "./build-dependencies.js";
import { createServer } from "./server.js";

const port = Number(process.env.SAF_ORCHESTRATOR_PORT ?? 3002);

// Two roles, deliberately: the admin (superuser/migration) connection only
// ever runs ensureSchema()'s DDL; every other operation goes through the
// non-superuser app connection. Postgres superusers bypass Row-Level
// Security unconditionally — see persistence-postgres/identity's README for
// how that was found (SAF-14). Getting this wrong here would silently
// reintroduce that exact bug for the outbox table.
const adminPool = new Pool({
  connectionString:
    process.env.SAF_POSTGRES_ADMIN_URL ??
    "postgres://saf:saf_dev_password@localhost:55432/sap_app_factory",
});
const appPool = new Pool({
  connectionString:
    process.env.SAF_POSTGRES_APP_URL ??
    "postgres://saf_app:saf_app_dev_password@localhost:55432/sap_app_factory",
});

const eventBus = new PostgresOutboxAdapter(appPool);

await new PostgresOutboxAdapter(adminPool).ensureSchema();
await adminPool.end();
await eventBus.start();

const deps = buildDependencies(eventBus);
const server = createServer(deps);
server.listen(port);

process.on("SIGTERM", () => {
  server.close();
  void eventBus.stop().then(() => appPool.end());
});
process.on("SIGINT", () => {
  server.close();
  void eventBus.stop().then(() => appPool.end());
});

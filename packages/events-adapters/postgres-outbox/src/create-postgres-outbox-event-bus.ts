import { Pool } from "pg";
import type { EventBusPort } from "@sap-app-factory/ports";
import { PostgresOutboxAdapter } from "./postgres-outbox-adapter.js";

const DEFAULT_ADMIN_URL = "postgres://saf:saf_dev_password@localhost:55432/sap_app_factory";
const DEFAULT_APP_URL = "postgres://saf_app:saf_app_dev_password@localhost:55432/sap_app_factory";

export interface PostgresOutboxEventBusOptions {
  readonly adminConnectionString?: string;
  readonly appConnectionString?: string;
}

export interface PostgresOutboxEventBus {
  readonly eventBus: EventBusPort;
  readonly stop: () => Promise<void>;
}

/**
 * The standard composition-root bootstrap for this adapter: `ensureSchema()`
 * via a superuser/admin pool (closed immediately after — it never runs
 * anything else), then the real running adapter connected as the
 * non-superuser `saf_app` role, with its relay started. Extracted into this
 * package once a second app (`worker`, after `orchestrator`) needed the
 * identical ~15 lines of Pool/role wiring — see CODING_STANDARDS.md's
 * "extract reusable startup patterns before duplication."
 *
 * Reads `SAF_POSTGRES_ADMIN_URL`/`SAF_POSTGRES_APP_URL` when no explicit
 * connection strings are passed, falling back to the docker-compose
 * defaults (`infra/docker-compose/.env.example`) so a bare `pnpm dev` works
 * against the standard local stack with no environment configuration at all.
 */
export async function createPostgresOutboxEventBus(
  options: PostgresOutboxEventBusOptions = {},
): Promise<PostgresOutboxEventBus> {
  const adminPool = new Pool({
    connectionString:
      options.adminConnectionString ?? process.env.SAF_POSTGRES_ADMIN_URL ?? DEFAULT_ADMIN_URL,
  });
  const appPool = new Pool({
    connectionString:
      options.appConnectionString ?? process.env.SAF_POSTGRES_APP_URL ?? DEFAULT_APP_URL,
  });

  await new PostgresOutboxAdapter(adminPool).ensureSchema();
  await adminPool.end();

  const eventBus = new PostgresOutboxAdapter(appPool);
  await eventBus.start();

  return {
    eventBus,
    stop: async () => {
      await eventBus.stop();
      await appPool.end();
    },
  };
}

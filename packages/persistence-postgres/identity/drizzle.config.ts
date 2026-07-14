import { defineConfig } from "drizzle-kit";

// SAF_TEST_POSTGRES_URL matches the env var the real-Postgres test suites
// already use (see events-adapters/postgres-outbox) — one convention for
// "point this at a real database," not a second one invented here.
const connectionString =
  process.env.SAF_TEST_POSTGRES_URL ??
  "postgres://saf:saf_dev_password@localhost:55432/sap_app_factory";

export default defineConfig({
  schema: "./src/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
});

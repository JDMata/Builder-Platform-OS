import { defineConfig } from "drizzle-kit";

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

import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.spec.ts"],
    testTimeout: 10_000,
    // Real-Keycloak/OPA integration specs in this package share live
    // external state (discovery caching, realm/session state) the same way
    // adapter-events-postgres-outbox's specs share a live Postgres —
    // serialize for the same reason (see that package's vitest.config.ts).
    fileParallelism: false,
  },
});

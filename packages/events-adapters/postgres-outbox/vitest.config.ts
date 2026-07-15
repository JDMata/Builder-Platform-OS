import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.spec.ts"],
    testTimeout: 10_000,
    // Two spec files here call ensureSchema() (CREATE SCHEMA IF NOT EXISTS)
    // against the same real, shared Postgres instance. Vitest's default
    // per-file parallelism let both race the same DDL concurrently — found
    // as a real "duplicate key value violates ... pg_namespace_nspname_index"
    // failure, not a hypothetical one. Files sharing live external state
    // must run serially; in-memory-only suites elsewhere in this monorepo
    // are unaffected and keep the default parallel behavior.
    fileParallelism: false,
  },
});

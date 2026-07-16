import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.spec.ts"],
    testTimeout: 10_000,
    // Four spec files' beforeAll hooks each run the same migrate() against
    // the same real database (unlike identity/governance, which have only
    // one spec file each and never race against themselves) — concurrent
    // `CREATE TABLE IF NOT EXISTS` on the shared migrations-tracking table's
    // sequence is not safe under Postgres's own concurrency guarantees.
    // Found by running this suite for real, not assumed: serialize file
    // execution rather than have each spec file re-derive its own
    // once-per-package migration guard.
    fileParallelism: false,
  },
});

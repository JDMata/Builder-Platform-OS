# @sap-app-factory/persistence-postgres-requirements

## Purpose
The `requirements` schema's Drizzle schema, migrations, and `Repository<T, string>` implementations for the four Requirements Intake aggregates (VS-1, Sprint 1) — `RequirementDocument`, `Requirement` (already domain-modeled in Sprint 0, persisted here for the first time), `Clarification`, `AcceptanceCriterion`. Each is its own table and its own repository, referenced by opaque id — no cross-aggregate foreign keys, same convention as `TargetSystemConnection` referencing `projectId`.

## Ports
Implements `Repository<T, string>` (`@sap-app-factory/ports`) once per aggregate. Depends on `@sap-app-factory/context-requirements` for the domain types — never the other way around. Adapter-tier.

## RLS strategy
Identical to `persistence-postgres/identity` — see that package's README for the full explanation (session-scoped `set_config`, fail-closed `current_setting`, `FORCE ROW LEVEL SECURITY`). The transaction-wrapping helper itself now lives in `persistence-postgres-shared` (`withTenantScope`), extracted here rather than copied a third and fourth time.

## Migration strategy
Same two-migration shape as `persistence-postgres/identity`: `0000_*.sql` (generated: `CREATE SCHEMA`, all four `CREATE TABLE`s) then `0001_requirements_rls.sql` (hand-written: RLS + grants on all four tables), tracked in `migrations/meta/_journal.json`, applied via a package-scoped `migrationsTable: "requirements_migrations"` (per the migration-tracking bug `persistence-postgres/identity`'s README documents finding).

## Testing
Real-Postgres integration tests, gated behind `SAF_TEST_POSTGRES_URL`/`SAF_TEST_POSTGRES_APP_URL`. Every repository passes `testing-kit`'s `repositoryContractTests`, including tenant isolation; `Clarification`'s `relatedRequirementIds` array column and each repository's `findBy*` scoped-listing method have their own dedicated tests beyond the generic contract suite.

**A real concurrency bug, found by running the full suite, not assumed:** this package has four spec files (one per repository), each running its own `beforeAll`'s `migrate()` against the same real database with the same `migrationsTable`. Unlike `persistence-postgres/identity`/`governance` (one spec file each, never racing against themselves), vitest's default file-level parallelism ran all four `migrate()` calls concurrently, and concurrent `CREATE TABLE IF NOT EXISTS` on the shared migrations-tracking sequence is not safe under Postgres's own concurrency guarantees (`duplicate key value violates unique constraint "pg_class_relname_nsp_index"`). Fixed with `fileParallelism: false` in `vitest.config.ts` — the correct fix for integration tests that all share one real, stateful resource, not a workaround.

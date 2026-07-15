# @sap-app-factory/persistence-postgres-identity

## Purpose
The `identity` schema's Drizzle schema, first migration, and `Repository<Tenant, string>` implementation (ADR-0009, SAF-14). First real proof of the schema/migration/RLS/repository pattern every other context's `persistence-postgres/<context>` module will follow.

## Ports
Implements `Repository<Tenant, string>` (`@sap-app-factory/ports`). Depends on `@sap-app-factory/context-identity` for the `Tenant` domain type — never the other way around. Adapter-tier; application code depends on `Repository<Tenant, string>`, never this package directly.

## Tenant resolution
This package does not itself resolve *which* physical database/schema a tenant's data lives in — that is `TenantConnectionResolverPort` (ADR-0013), not yet wired to a real adapter (every tenant is Pooled-tier in Sprint 0, one shared instance). What this package does own: given a `pg.Pool` already pointed at the right instance, every call scopes itself to `ctx.tenantId` for the duration of one transaction.

## RLS strategy
- `app.tenant_id` is set via `SELECT set_config('app.tenant_id', $1, true)` at the start of every repository call's transaction — the third argument (`is_local`) scopes it to *that transaction only*. This matters because connections are pooled and reused across different tenants' requests; a plain `SET` (session-scoped) would leak the previous request's tenant onto the next one that reuses the same connection.
- The RLS policy (`migrations/0001_identity_rls.sql`) reads it back via `current_setting('app.tenant_id', true)` — the missing-ok form. If unset, this returns `NULL`, and `tenant_id = NULL` is never true in SQL: **fail-closed** (zero rows), not a thrown error and not an accidental full-table read. Verified directly in `tenant-repository.spec.ts`.
- `FORCE ROW LEVEL SECURITY` is set in addition to `ENABLE ROW LEVEL SECURITY` — by default Postgres RLS does not apply to a table's owning role, so without `FORCE`, a connection using the same role that ran the migration would silently bypass the policy. Verified directly (`relforcerowsecurity` check in the spec file).

## Administrative access
There is no bypass path implemented yet — Sprint 0 has exactly one Postgres role. The intended future shape (documented, not built): a separate, explicitly `BYPASSRLS`-attributed administrative role for genuine cross-tenant operations (e.g., a `PlatformAdmin` listing every tenant), used only by code paths that have their own authorization check independent of RLS — never the default connection every repository call uses.

## Migration strategy
Drizzle Kit generates schema migrations (`pnpm db:generate`); RLS policies are hand-written SQL migrations alongside the generated ones (Drizzle Kit's schema DSL doesn't express `CREATE POLICY`) — `0000_*.sql` (generated: `CREATE SCHEMA`, `CREATE TABLE`) then `0001_identity_rls.sql` (hand-written: `ENABLE`/`FORCE ROW LEVEL SECURITY`, `CREATE POLICY`), both tracked in `migrations/meta/_journal.json` and applied in order by `drizzle-orm/node-postgres/migrator`'s `migrate()`. The same pattern repeats for `0002_*.sql` (generated: `permissions`, `roles`, `role_permissions`, `user_roles` tables, SAF-17) and `0003_identity_roles_permissions_rls.sql` (hand-written: RLS on `permissions`/`roles`/`user_roles`; `role_permissions` has no `tenant_id` column — a join table between two tenant-scoped tables is itself scoped transitively, so it's granted access but carries no `tenant_isolation` policy of its own).

## Testing
Real-Postgres integration tests (not mocks), gated behind `SAF_TEST_POSTGRES_URL` exactly like `events-adapters/postgres-outbox` — see that package's spec file for how to point this at a throwaway container. `TenantRepository` passes `testing-kit`'s new `repositoryContractTests` for real, including its tenant-isolation assertion, plus two RLS-specific tests: fail-closed behavior with no `app.tenant_id` set, and `FORCE ROW LEVEL SECURITY` actually being set on the table.

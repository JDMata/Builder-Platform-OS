# @sap-app-factory/persistence-postgres-project

## Purpose
The `project` schema's Drizzle schema, migrations, and `Repository<Project, string>` implementation (VS-1, Sprint 1) — the first real persistence for the Project & Workspace context. `Workspace` (Sprint 0) has no repository yet; nothing needed to persist it before now, and VS-1 only needs an existing `workspaceId` reference, not to create or query Workspaces itself.

## Ports
Implements `Repository<Project, string>` (`@sap-app-factory/ports`). Depends on `@sap-app-factory/context-project` for the `Project` domain type. Adapter-tier.

## RLS strategy
Identical to `persistence-postgres/identity` and `persistence-postgres/requirements` — see either README for the full explanation. Uses `persistence-postgres-shared`'s `withTenantScope`.

## Migration strategy
Same two-migration shape as `persistence-postgres/requirements`: `0000_*.sql` (generated) then `0001_project_rls.sql` (hand-written RLS + grants), package-scoped `migrationsTable: "project_migrations"`.

## Testing
Real-Postgres integration tests, gated behind `SAF_TEST_POSTGRES_URL`/`SAF_TEST_POSTGRES_APP_URL`. `ProjectRepository` passes `testing-kit`'s `repositoryContractTests`, including tenant isolation.

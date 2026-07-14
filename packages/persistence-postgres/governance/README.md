# @sap-app-factory/persistence-postgres-governance

## Purpose
The `governance` schema's first migration and `Repository<AuditEvent, string>` implementation (ADR-0009 revision, ADR-0017, SAF-14) — the monthly-partitioned-table proof, alongside `persistence-postgres/identity`'s RLS proof.

## Ports
Implements `Repository<AuditEvent, string>` (`@sap-app-factory/ports`). Depends on `@sap-app-factory/context-governance` for the `AuditEvent` domain type.

## Tenant resolution & RLS strategy
Identical mechanism to `persistence-postgres/identity` — see that package's README for the full explanation (`set_config('app.tenant_id', $1, true)` scoped per-transaction, `current_setting(..., true)` fail-closed policy, non-superuser `saf_app` role). Not repeated here to avoid the two copies drifting apart.

## Administrative access
Same as `persistence-postgres/identity`: no bypass path built yet; the intended shape is a separate `BYPASSRLS` role for genuine cross-tenant governance/compliance queries, never the connection every repository call uses.

## Migration strategy
Unlike `identity`'s migrations, **this package's are entirely hand-written**, not `drizzle-kit generate` output — Drizzle Kit's schema DSL has no first-class way to express `PARTITION BY RANGE`. `schema.ts` still exists and is used by `drizzle-orm`'s query builder at runtime; it just isn't the source Drizzle Kit generates SQL from here. Two migrations, tracked in `migrations/meta/_journal.json` exactly like a generated package so `drizzle-orm/node-postgres/migrator`'s `migrate()` applies both in order:
- `0000_governance_init.sql` — `CREATE TABLE ... PARTITION BY RANGE (created_at)`, seeded with three monthly partitions (current month + a two-month buffer).
- `0001_governance_rls.sql` — RLS (identical approach to `identity`) + grants to `saf_app`. RLS policies on a partitioned table apply automatically to every partition, present and future — no per-partition policy needed.

**Operational task not yet built:** creating each new month's partition ahead of time is a scheduled job for Sprint 1/2, not built here. A write outside every existing partition's range fails outright (`no partition of relation ... found for row`) rather than silently landing in the wrong place or falling back to a default partition — verified directly in the spec file. This is the correct fail-closed behavior for a compliance-relevant, append-only table: a loud failure that pages someone to add a partition, not silent data loss or misplacement.

## A known, deliberate limitation: `id` alone isn't unique
Postgres requires a partitioned table's primary key to include the partition column, so the real primary key is `(id, created_at)`, not `id` alone — there is no way to add a true cross-partition unique index on `id` without abandoning partitioning (Postgres has no "global unique index" across partitions as of the version used here). Practical consequences:
- `AuditEventRepository.save()` cannot use `ON CONFLICT (id)` the way `TenantRepository.save()` can — calling it twice with the same domain event writes two physical rows, not one.
- This is acceptable for Sprint 0: `findById()` still returns content that compares equal either way (only domain fields are exposed, never `created_at`), and nothing in Sprint 0 resubmits the same audit event. Real production hardening (a time-ordered id scheme such as UUIDv7/ULID, or an explicit dedup step) is future work, not solved here.

## Testing
Real-Postgres integration tests (not mocks), gated behind `SAF_TEST_POSTGRES_URL`/`SAF_TEST_POSTGRES_APP_URL` exactly like `persistence-postgres/identity`. `AuditEventRepository` passes `testing-kit`'s `repositoryContractTests` for real (using the append-only variant — no `mutateAggregate` fixture), plus partition-specific tests: the table is genuinely partitioned (not just similarly named), a row lands in the partition matching its `created_at`, a write outside every partition's range fails loudly, and the RLS fail-closed behavior holds.

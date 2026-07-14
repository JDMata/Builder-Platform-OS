import { pgSchema, text, timestamp } from "drizzle-orm/pg-core";

/** One Postgres schema per bounded context (ADR-0009) — `governance`. */
export const governanceSchema = pgSchema("governance");

/**
 * Column definitions only — the physical table (`CREATE TABLE ... PARTITION
 * BY RANGE`) is hand-written SQL in migrations/0000_governance_init.sql, not
 * generated from this file. Drizzle Kit's schema DSL has no first-class way
 * to express range partitioning, so this file exists purely to give
 * drizzle-orm's query builder a typed view of the same columns — see
 * README.md § Migration strategy for why this package's migrations aren't
 * `drizzle-kit generate` output, unlike `persistence-postgres/identity`.
 *
 * `id` alone is not a database-enforced unique key: Postgres requires a
 * partitioned table's primary key to include the partition column
 * (`created_at`), so the real primary key is `(id, created_at)`. Uniqueness
 * of `id` alone is a producer convention (UUIDs), not a DB constraint — a
 * documented, deliberate limitation of partitioning by time.
 */
export const auditEvents = governanceSchema.table("audit_events", {
  id: text("id").notNull(),
  tenantId: text("tenant_id").notNull(),
  actorId: text("actor_id").notNull(),
  action: text("action").notNull(),
  occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

import { pgSchema, text } from "drizzle-orm/pg-core";

/**
 * One Postgres schema per bounded context (ADR-0009) — `identity`, owned by
 * this package's migration role, per 09-database-proposal.md.
 */
export const identitySchema = pgSchema("identity");

/**
 * `tenant_id` is the calling session's tenant (`ctx.tenantId`), not
 * necessarily this row's own `id` — see `TenantRepository`'s doc comment for
 * why those are kept as two separate values. RLS still applies (see
 * migrations/0001_identity_rls.sql): a session scoped to tenant X can only
 * read/write rows written under tenant X through this repository — genuine
 * cross-tenant registry access (a PlatformAdmin listing all tenants) is a
 * separate, explicitly-privileged path, never this repository. See
 * README.md § RLS strategy.
 */
export const tenants = identitySchema.table("tenants", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull(),
});

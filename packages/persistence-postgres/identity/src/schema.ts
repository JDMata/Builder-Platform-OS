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

/**
 * SAF-17's "role/permission schema... empty seed data only, no UI"
 * (08-authentication-and-rbac.md). Schema only — no repository is built yet,
 * since nothing calls one: `auth-core`'s Sprint 0 scope is session handling
 * and the policy-engine adapter, not an RBAC admin UI. Real `Role`/
 * `Permission` domain aggregates exist in `@sap-app-factory/context-identity`;
 * this is where they'd persist once a real use case needs it.
 */
export const permissions = identitySchema.table("permissions", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  resource: text("resource").notNull(),
  action: text("action").notNull(),
});

export const roles = identitySchema.table("roles", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  name: text("name").notNull(),
  status: text("status").notNull(),
});

/** No cross-schema/cross-table FK constraints per ADR-0009 — `roleId`/`permissionId` are plain ID columns. */
export const rolePermissions = identitySchema.table("role_permissions", {
  roleId: text("role_id").notNull(),
  permissionId: text("permission_id").notNull(),
});

export const userRoles = identitySchema.table("user_roles", {
  userId: text("user_id").notNull(),
  roleId: text("role_id").notNull(),
  tenantId: text("tenant_id").notNull(),
});

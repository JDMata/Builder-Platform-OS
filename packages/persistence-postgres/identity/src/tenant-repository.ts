import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import type { Repository, RequestContext } from "@sap-app-factory/ports";
import type { Tenant, TenantStatus } from "@sap-app-factory/context-identity";
import { withTenantScope } from "@sap-app-factory/persistence-postgres-shared";
import { tenants } from "./schema.js";

/**
 * Drizzle implementation of `Repository<Tenant, string>` (ADR-0009).
 *
 * `tenant_id` is populated from `ctx.tenantId` at save time — the tenant the
 * *calling session* is scoped to, not necessarily the same value as the
 * `Tenant` aggregate's own `id` (its registry-record identity). They often
 * coincide in practice (a tenant reading/updating its own profile), but
 * treating them as the same column would make onboarding a brand-new tenant
 * — inherently a platform-admin operation, performed by a session that
 * *isn't* that tenant yet — structurally impossible under RLS. See README.md
 * § RLS strategy for how this was found.
 *
 * Every call runs inside its own transaction via `withTenantScope`
 * (`persistence-postgres-shared`), which sets `app.tenant_id` — the session
 * variable the RLS policy in `migrations/0001_rls.sql` reads via
 * `current_setting('app.tenant_id', true)`, fail-closed by default.
 */
export class TenantRepository implements Repository<Tenant, string> {
  constructor(private readonly pool: Pool) {}

  async findById(ctx: RequestContext, id: string): Promise<Tenant | undefined> {
    return withTenantScope(this.pool, ctx, async (client) => {
      const db = drizzle(client);
      const rows = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
      const row = rows[0];
      return row ? toTenant(row) : undefined;
    });
  }

  async save(ctx: RequestContext, tenant: Tenant): Promise<void> {
    await withTenantScope(this.pool, ctx, async (client) => {
      const db = drizzle(client);
      await db
        .insert(tenants)
        .values({
          id: tenant.id,
          tenantId: ctx.tenantId,
          name: tenant.name,
          status: tenant.status,
        })
        .onConflictDoUpdate({
          target: tenants.id,
          set: { name: tenant.name, status: tenant.status },
        });
    });
  }
}

function toTenant(row: typeof tenants.$inferSelect): Tenant {
  return { id: row.id, name: row.name, status: row.status as TenantStatus };
}

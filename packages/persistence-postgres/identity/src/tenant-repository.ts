import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool, PoolClient } from "pg";
import type { Repository, RequestContext } from "@sap-app-factory/ports";
import type { Tenant, TenantStatus } from "@sap-app-factory/context-identity";
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
 * Every call runs inside its own transaction with `app.tenant_id` set via
 * `set_config(..., true)` — the `true` (`is_local`) argument scopes the
 * setting to *this transaction only*, so it can never leak onto a pooled
 * connection reused by a different tenant's request afterward. This is the
 * session variable the RLS policy in `migrations/0001_rls.sql` reads via
 * `current_setting('app.tenant_id', true)` — using the missing-ok form there
 * too means an unset value compares as NULL against `tenant_id`, which is
 * never true in SQL: fail-closed (zero rows), not a thrown error and not an
 * accidental full-table read.
 */
export class TenantRepository implements Repository<Tenant, string> {
  constructor(private readonly pool: Pool) {}

  async findById(ctx: RequestContext, id: string): Promise<Tenant | undefined> {
    return this.withTenantScope(ctx, async (client) => {
      const db = drizzle(client);
      const rows = await db.select().from(tenants).where(eq(tenants.id, id)).limit(1);
      const row = rows[0];
      return row ? toTenant(row) : undefined;
    });
  }

  async save(ctx: RequestContext, tenant: Tenant): Promise<void> {
    await this.withTenantScope(ctx, async (client) => {
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

  private async withTenantScope<T>(
    ctx: RequestContext,
    fn: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("SELECT set_config('app.tenant_id', $1, true)", [ctx.tenantId]);
      const result = await fn(client);
      await client.query("COMMIT");
      return result;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

function toTenant(row: typeof tenants.$inferSelect): Tenant {
  return { id: row.id, name: row.name, status: row.status as TenantStatus };
}

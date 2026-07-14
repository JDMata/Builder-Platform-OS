import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool, PoolClient } from "pg";
import type { Repository, RequestContext } from "@sap-app-factory/ports";
import type { AuditEvent } from "@sap-app-factory/context-governance";
import { auditEvents } from "./schema.js";

/**
 * Drizzle implementation of `Repository<AuditEvent, string>` (ADR-0009
 * revision, ADR-0017) — the monthly-partitioned-table proof for SAF-14.
 *
 * `id` alone is not database-unique on a partitioned table (Postgres
 * requires the partition column, `created_at`, in any unique constraint —
 * see schema.ts), so `save()` cannot use `ON CONFLICT (id)` the way
 * `TenantRepository.save()` does. Calling `save()` twice with the same
 * domain event therefore writes two physical rows, not one updated row —
 * a known, deliberate Sprint 0 limitation of this partitioning approach
 * (see README.md § Migration strategy), acceptable because nothing in
 * Sprint 0 resubmits the same audit event, and because `findById` still
 * returns content that compares equal from the caller's point of view
 * either way (this repository never exposes `created_at`, only the
 * `AuditEvent` domain fields).
 *
 * Same tenant-scoping and RLS approach as `TenantRepository` — see that
 * package's README for the full explanation (session-scoped
 * `set_config`, fail-closed policy, non-superuser `saf_app` role).
 */
export class AuditEventRepository implements Repository<AuditEvent, string> {
  constructor(private readonly pool: Pool) {}

  async findById(ctx: RequestContext, id: string): Promise<AuditEvent | undefined> {
    return this.withTenantScope(ctx, async (client) => {
      const db = drizzle(client);
      const rows = await db
        .select()
        .from(auditEvents)
        .where(eq(auditEvents.id, id))
        .orderBy(desc(auditEvents.createdAt))
        .limit(1);
      const row = rows[0];
      return row ? toAuditEvent(row) : undefined;
    });
  }

  async save(ctx: RequestContext, event: AuditEvent): Promise<void> {
    await this.withTenantScope(ctx, async (client) => {
      const db = drizzle(client);
      await db.insert(auditEvents).values({
        id: event.id,
        tenantId: event.tenantId,
        actorId: event.actorId,
        action: event.action,
        occurredAt: new Date(event.occurredAt),
        createdAt: new Date(),
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

function toAuditEvent(row: typeof auditEvents.$inferSelect): AuditEvent {
  return {
    id: row.id,
    tenantId: row.tenantId,
    actorId: row.actorId,
    action: row.action,
    occurredAt: row.occurredAt.toISOString(),
  };
}

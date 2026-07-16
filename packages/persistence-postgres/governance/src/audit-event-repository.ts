import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import type { Repository, RequestContext } from "@sap-app-factory/ports";
import type { AuditEvent } from "@sap-app-factory/context-governance";
import { withTenantScope } from "@sap-app-factory/persistence-postgres-shared";
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
    return withTenantScope(this.pool, ctx, async (client) => {
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
    await withTenantScope(this.pool, ctx, async (client) => {
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

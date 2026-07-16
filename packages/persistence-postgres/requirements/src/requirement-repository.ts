import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import type { Repository, RequestContext } from "@sap-app-factory/ports";
import type { Requirement } from "@sap-app-factory/context-requirements";
import { withTenantScope } from "@sap-app-factory/persistence-postgres-shared";
import { requirements } from "./schema.js";

/** Drizzle implementation of `Repository<Requirement, string>` (ADR-0009). */
export class RequirementRepository implements Repository<Requirement, string> {
  constructor(private readonly pool: Pool) {}

  async findById(ctx: RequestContext, id: string): Promise<Requirement | undefined> {
    return withTenantScope(this.pool, ctx, async (client) => {
      const db = drizzle(client);
      const rows = await db.select().from(requirements).where(eq(requirements.id, id)).limit(1);
      const row = rows[0];
      return row ? toRequirement(row) : undefined;
    });
  }

  /** All `Requirement`s belonging to one `RequirementDocument`, tenant-scoped like any other read here. */
  async findByRequirementDocumentId(
    ctx: RequestContext,
    requirementDocumentId: string,
  ): Promise<readonly Requirement[]> {
    return withTenantScope(this.pool, ctx, async (client) => {
      const db = drizzle(client);
      const rows = await db
        .select()
        .from(requirements)
        .where(eq(requirements.requirementDocumentId, requirementDocumentId));
      return rows.map(toRequirement);
    });
  }

  async save(ctx: RequestContext, requirement: Requirement): Promise<void> {
    await withTenantScope(this.pool, ctx, async (client) => {
      const db = drizzle(client);
      await db
        .insert(requirements)
        .values({
          id: requirement.id,
          tenantId: ctx.tenantId,
          requirementDocumentId: requirement.requirementDocumentId,
          kind: requirement.kind,
          description: requirement.description,
          status: requirement.status,
        })
        .onConflictDoUpdate({
          target: requirements.id,
          set: { description: requirement.description, status: requirement.status },
        });
    });
  }
}

function toRequirement(row: typeof requirements.$inferSelect): Requirement {
  return {
    id: row.id,
    requirementDocumentId: row.requirementDocumentId,
    kind: row.kind as Requirement["kind"],
    description: row.description,
    status: row.status as Requirement["status"],
  };
}

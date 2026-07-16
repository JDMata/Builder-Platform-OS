import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import type { Repository, RequestContext } from "@sap-app-factory/ports";
import type { AcceptanceCriterion } from "@sap-app-factory/context-requirements";
import { withTenantScope } from "@sap-app-factory/persistence-postgres-shared";
import { acceptanceCriteria } from "./schema.js";

/** Drizzle implementation of `Repository<AcceptanceCriterion, string>` (ADR-0009). */
export class AcceptanceCriterionRepository implements Repository<AcceptanceCriterion, string> {
  constructor(private readonly pool: Pool) {}

  async findById(ctx: RequestContext, id: string): Promise<AcceptanceCriterion | undefined> {
    return withTenantScope(this.pool, ctx, async (client) => {
      const db = drizzle(client);
      const rows = await db
        .select()
        .from(acceptanceCriteria)
        .where(eq(acceptanceCriteria.id, id))
        .limit(1);
      const row = rows[0];
      return row ? toAcceptanceCriterion(row) : undefined;
    });
  }

  async findByRequirementId(
    ctx: RequestContext,
    requirementId: string,
  ): Promise<readonly AcceptanceCriterion[]> {
    return withTenantScope(this.pool, ctx, async (client) => {
      const db = drizzle(client);
      const rows = await db
        .select()
        .from(acceptanceCriteria)
        .where(eq(acceptanceCriteria.requirementId, requirementId));
      return rows.map(toAcceptanceCriterion);
    });
  }

  async save(ctx: RequestContext, criterion: AcceptanceCriterion): Promise<void> {
    await withTenantScope(this.pool, ctx, async (client) => {
      const db = drizzle(client);
      await db
        .insert(acceptanceCriteria)
        .values({
          id: criterion.id,
          tenantId: ctx.tenantId,
          requirementId: criterion.requirementId,
          description: criterion.description,
          origin: criterion.origin,
          status: criterion.status,
        })
        .onConflictDoUpdate({
          target: acceptanceCriteria.id,
          set: { status: criterion.status },
        });
    });
  }
}

function toAcceptanceCriterion(row: typeof acceptanceCriteria.$inferSelect): AcceptanceCriterion {
  return {
    id: row.id,
    requirementId: row.requirementId,
    description: row.description,
    origin: row.origin as AcceptanceCriterion["origin"],
    status: row.status as AcceptanceCriterion["status"],
  };
}

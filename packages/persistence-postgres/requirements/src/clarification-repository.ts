import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import type { Repository, RequestContext } from "@sap-app-factory/ports";
import type { Clarification } from "@sap-app-factory/context-requirements";
import { withTenantScope } from "@sap-app-factory/persistence-postgres-shared";
import { clarifications } from "./schema.js";

/** Drizzle implementation of `Repository<Clarification, string>` (ADR-0009). */
export class ClarificationRepository implements Repository<Clarification, string> {
  constructor(private readonly pool: Pool) {}

  async findById(ctx: RequestContext, id: string): Promise<Clarification | undefined> {
    return withTenantScope(this.pool, ctx, async (client) => {
      const db = drizzle(client);
      const rows = await db.select().from(clarifications).where(eq(clarifications.id, id)).limit(1);
      const row = rows[0];
      return row ? toClarification(row) : undefined;
    });
  }

  async findByRequirementDocumentId(
    ctx: RequestContext,
    requirementDocumentId: string,
  ): Promise<readonly Clarification[]> {
    return withTenantScope(this.pool, ctx, async (client) => {
      const db = drizzle(client);
      const rows = await db
        .select()
        .from(clarifications)
        .where(eq(clarifications.requirementDocumentId, requirementDocumentId));
      return rows.map(toClarification);
    });
  }

  async save(ctx: RequestContext, clarification: Clarification): Promise<void> {
    await withTenantScope(this.pool, ctx, async (client) => {
      const db = drizzle(client);
      await db
        .insert(clarifications)
        .values({
          id: clarification.id,
          tenantId: ctx.tenantId,
          requirementDocumentId: clarification.requirementDocumentId,
          question: clarification.question,
          sourceFragment: clarification.sourceFragment,
          relatedRequirementIds: [...clarification.relatedRequirementIds],
          answer: clarification.answer,
          status: clarification.status,
        })
        .onConflictDoUpdate({
          target: clarifications.id,
          set: { answer: clarification.answer, status: clarification.status },
        });
    });
  }
}

function toClarification(row: typeof clarifications.$inferSelect): Clarification {
  return {
    id: row.id,
    requirementDocumentId: row.requirementDocumentId,
    question: row.question,
    sourceFragment: row.sourceFragment,
    relatedRequirementIds: row.relatedRequirementIds,
    answer: row.answer ?? undefined,
    status: row.status as Clarification["status"],
  };
}

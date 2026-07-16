import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import type { Repository, RequestContext } from "@sap-app-factory/ports";
import type { RequirementDocument } from "@sap-app-factory/context-requirements";
import { withTenantScope } from "@sap-app-factory/persistence-postgres-shared";
import { requirementDocuments } from "./schema.js";

/** Drizzle implementation of `Repository<RequirementDocument, string>` (ADR-0009). */
export class RequirementDocumentRepository implements Repository<RequirementDocument, string> {
  constructor(private readonly pool: Pool) {}

  async findById(ctx: RequestContext, id: string): Promise<RequirementDocument | undefined> {
    return withTenantScope(this.pool, ctx, async (client) => {
      const db = drizzle(client);
      const rows = await db
        .select()
        .from(requirementDocuments)
        .where(eq(requirementDocuments.id, id))
        .limit(1);
      const row = rows[0];
      return row ? toRequirementDocument(row) : undefined;
    });
  }

  async save(ctx: RequestContext, document: RequirementDocument): Promise<void> {
    await withTenantScope(this.pool, ctx, async (client) => {
      const db = drizzle(client);
      await db
        .insert(requirementDocuments)
        .values({
          id: document.id,
          tenantId: ctx.tenantId,
          workspaceId: document.workspaceId,
          ideaText: document.ideaText,
          suggestedProjectName: document.suggestedProjectName,
          status: document.status,
        })
        .onConflictDoUpdate({
          target: requirementDocuments.id,
          set: {
            suggestedProjectName: document.suggestedProjectName,
            status: document.status,
          },
        });
    });
  }
}

function toRequirementDocument(row: typeof requirementDocuments.$inferSelect): RequirementDocument {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    ideaText: row.ideaText,
    suggestedProjectName: row.suggestedProjectName,
    status: row.status as RequirementDocument["status"],
  };
}

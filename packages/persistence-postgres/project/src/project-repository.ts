import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import type { Pool } from "pg";
import type { Repository, RequestContext } from "@sap-app-factory/ports";
import type { Project } from "@sap-app-factory/context-project";
import { withTenantScope } from "@sap-app-factory/persistence-postgres-shared";
import { projects } from "./schema.js";

/** Drizzle implementation of `Repository<Project, string>` (ADR-0009). */
export class ProjectRepository implements Repository<Project, string> {
  constructor(private readonly pool: Pool) {}

  async findById(ctx: RequestContext, id: string): Promise<Project | undefined> {
    return withTenantScope(this.pool, ctx, async (client) => {
      const db = drizzle(client);
      const rows = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
      const row = rows[0];
      return row ? toProject(row) : undefined;
    });
  }

  async save(ctx: RequestContext, project: Project): Promise<void> {
    await withTenantScope(this.pool, ctx, async (client) => {
      const db = drizzle(client);
      await db
        .insert(projects)
        .values({
          id: project.id,
          tenantId: ctx.tenantId,
          workspaceId: project.workspaceId,
          name: project.name,
          description: project.description,
          sourceRequirementDocumentId: project.sourceRequirementDocumentId,
        })
        .onConflictDoUpdate({
          target: projects.id,
          set: { name: project.name, description: project.description },
        });
    });
  }
}

function toProject(row: typeof projects.$inferSelect): Project {
  return {
    id: row.id,
    workspaceId: row.workspaceId,
    name: row.name,
    description: row.description,
    sourceRequirementDocumentId: row.sourceRequirementDocumentId,
  };
}

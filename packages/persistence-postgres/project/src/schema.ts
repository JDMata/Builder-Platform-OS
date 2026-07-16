import { pgSchema, text } from "drizzle-orm/pg-core";

/**
 * One Postgres schema per bounded context (ADR-0009) — `project`. This is
 * the first real persistence package for the Project & Workspace context;
 * `Workspace` (Sprint 0) has no repository yet — nothing has needed to
 * persist it before VS-1, which only needs an existing `workspaceId`
 * reference, not to create or query Workspaces itself.
 */
export const projectSchema = pgSchema("project");

export const projects = projectSchema.table("projects", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  workspaceId: text("workspace_id").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  sourceRequirementDocumentId: text("source_requirement_document_id").notNull(),
});

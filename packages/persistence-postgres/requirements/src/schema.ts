import { pgSchema, text } from "drizzle-orm/pg-core";

/** One Postgres schema per bounded context (ADR-0009) — `requirements`. */
export const requirementsSchema = pgSchema("requirements");

export const requirementDocuments = requirementsSchema.table("requirement_documents", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  workspaceId: text("workspace_id").notNull(),
  ideaText: text("idea_text").notNull(),
  suggestedProjectName: text("suggested_project_name").notNull(),
  status: text("status").notNull(),
});

/** No FK to `requirement_documents` per ADR-0009 — opaque id reference only. */
export const requirements = requirementsSchema.table("requirements", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  requirementDocumentId: text("requirement_document_id").notNull(),
  kind: text("kind").notNull(),
  description: text("description").notNull(),
  status: text("status").notNull(),
});

export const clarifications = requirementsSchema.table("clarifications", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  requirementDocumentId: text("requirement_document_id").notNull(),
  question: text("question").notNull(),
  sourceFragment: text("source_fragment").notNull(),
  relatedRequirementIds: text("related_requirement_ids").array().notNull(),
  answer: text("answer"),
  status: text("status").notNull(),
});

export const acceptanceCriteria = requirementsSchema.table("acceptance_criteria", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  requirementId: text("requirement_id").notNull(),
  description: text("description").notNull(),
  origin: text("origin").notNull(),
  status: text("status").notNull(),
});

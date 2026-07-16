CREATE SCHEMA "project";
--> statement-breakpoint
CREATE TABLE "project"."projects" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"source_requirement_document_id" text NOT NULL
);

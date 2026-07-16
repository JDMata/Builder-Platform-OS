CREATE SCHEMA "requirements";
--> statement-breakpoint
CREATE TABLE "requirements"."acceptance_criteria" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"requirement_id" text NOT NULL,
	"description" text NOT NULL,
	"origin" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requirements"."clarifications" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"requirement_document_id" text NOT NULL,
	"question" text NOT NULL,
	"source_fragment" text NOT NULL,
	"related_requirement_ids" text[] NOT NULL,
	"answer" text,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requirements"."requirement_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"workspace_id" text NOT NULL,
	"idea_text" text NOT NULL,
	"suggested_project_name" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "requirements"."requirements" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"requirement_document_id" text NOT NULL,
	"kind" text NOT NULL,
	"description" text NOT NULL,
	"status" text NOT NULL
);

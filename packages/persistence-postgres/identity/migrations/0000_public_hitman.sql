CREATE SCHEMA "identity";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "identity"."tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_id" text NOT NULL,
	"name" text NOT NULL,
	"status" text NOT NULL
);

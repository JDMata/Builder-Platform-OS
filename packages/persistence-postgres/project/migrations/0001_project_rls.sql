-- Row-Level Security for project.projects (ADR-0013, ADR-0009 revision).
-- Same fail-closed, FORCE-RLS approach as persistence-postgres/identity.

ALTER TABLE "project"."projects" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "project"."projects" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "project"."projects"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint

GRANT USAGE ON SCHEMA "project" TO saf_app;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "project"."projects" TO saf_app;

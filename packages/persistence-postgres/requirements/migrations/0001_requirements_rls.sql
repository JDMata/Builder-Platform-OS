-- Row-Level Security for every requirements.* table (ADR-0013, ADR-0009 revision).
-- Same fail-closed, FORCE-RLS, non-superuser-role approach as
-- persistence-postgres/identity — see that package's README for the full
-- explanation of why FORCE matters and why current_setting's missing-ok
-- form is what makes this fail-closed rather than error-or-leak.

ALTER TABLE "requirements"."requirement_documents" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "requirements"."requirement_documents" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "requirements"."requirement_documents"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "requirements"."requirements" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "requirements"."requirements" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "requirements"."requirements"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "requirements"."clarifications" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "requirements"."clarifications" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "requirements"."clarifications"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "requirements"."acceptance_criteria" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "requirements"."acceptance_criteria" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "requirements"."acceptance_criteria"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint

-- "saf_app" (infra/docker-compose/postgres-init/01-create-app-role.sql) is
-- the non-superuser role every repository connects as.
GRANT USAGE ON SCHEMA "requirements" TO saf_app;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "requirements"."requirement_documents" TO saf_app;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "requirements"."requirements" TO saf_app;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "requirements"."clarifications" TO saf_app;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "requirements"."acceptance_criteria" TO saf_app;

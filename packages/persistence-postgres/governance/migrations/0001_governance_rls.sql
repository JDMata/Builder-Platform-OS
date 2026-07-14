-- Row-Level Security for governance.audit_events (ADR-0013, ADR-0009 revision).
-- RLS policies on a partitioned table apply automatically to every existing
-- and future partition — no per-partition policy needed.
ALTER TABLE "governance"."audit_events" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "governance"."audit_events" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

CREATE POLICY "tenant_isolation" ON "governance"."audit_events"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint

-- Same non-superuser app role as identity's migration (created once, shared
-- across every context's schema — see infra/docker-compose/postgres-init).
GRANT USAGE ON SCHEMA "governance" TO saf_app;
--> statement-breakpoint
GRANT SELECT, INSERT ON "governance"."audit_events" TO saf_app;

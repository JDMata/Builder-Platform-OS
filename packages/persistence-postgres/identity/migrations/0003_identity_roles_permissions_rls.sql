-- RLS for the role/permission schema (SAF-17), same strategy as 0001's
-- tenants table (see README.md § RLS strategy) — applied to every table
-- that carries tenant_id. "role_permissions" is a pure many-to-many join
-- with no tenant_id column of its own (its rows are scoped transitively
-- through "roles", which is RLS-protected) — granted access, not given its
-- own policy, since there's no tenant_id here to write a USING clause against.
ALTER TABLE "identity"."permissions" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "identity"."permissions" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "identity"."permissions"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "identity"."roles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "identity"."roles" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "identity"."roles"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint

ALTER TABLE "identity"."user_roles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "identity"."user_roles" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint
CREATE POLICY "tenant_isolation" ON "identity"."user_roles"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint

GRANT SELECT, INSERT, UPDATE ON "identity"."permissions" TO saf_app;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "identity"."roles" TO saf_app;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "identity"."user_roles" TO saf_app;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "identity"."role_permissions" TO saf_app;

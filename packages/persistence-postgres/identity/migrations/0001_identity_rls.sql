-- Row-Level Security for identity.tenants (ADR-0013, ADR-0009 revision).
--
-- FORCE ROW LEVEL SECURITY matters as much as ENABLE: by default Postgres
-- RLS does not apply to a table's owning role, so a buggy or compromised
-- connection using the same role that ran this migration would otherwise
-- silently bypass the policy below. FORCE closes that gap for this
-- single-role Sprint 0 setup; genuine cross-tenant administrative access
-- uses a separate, explicitly BYPASSRLS-attributed role, never this one.
ALTER TABLE "identity"."tenants" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "identity"."tenants" FORCE ROW LEVEL SECURITY;
--> statement-breakpoint

-- current_setting(..., true) (missing_ok) returns NULL rather than raising
-- when app.tenant_id was never set for this session — NULL never equals
-- tenant_id, so the policy denies by default (fail-closed) instead of
-- either erroring or, worse, silently returning every tenant's row.
CREATE POLICY "tenant_isolation" ON "identity"."tenants"
  USING (tenant_id = current_setting('app.tenant_id', true));
--> statement-breakpoint

-- "saf_app" (created by infra/docker-compose/postgres-init/01-create-app-role.sql)
-- is the non-superuser role every repository connects as. Without this grant
-- it could not read/write the table at all; without it being non-superuser,
-- RLS would silently do nothing — see this package's README for how that
-- was found.
GRANT USAGE ON SCHEMA "identity" TO saf_app;
--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE ON "identity"."tenants" TO saf_app;


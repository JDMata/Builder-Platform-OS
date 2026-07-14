-- Runs once, on first container init (official postgres image convention:
-- /docker-entrypoint-initdb.d/*.sql). Creates the non-superuser role every
-- persistence-postgres/<context> repository connects as at runtime.
--
-- This exists because of a real finding (SAF-14): the container's bootstrap
-- user (SAF_POSTGRES_USER, e.g. "saf") is a superuser, and Postgres
-- superusers bypass Row-Level Security unconditionally — FORCE ROW LEVEL
-- SECURITY explicitly does not exempt them from that exemption. RLS policies
-- silently do nothing at all until application code stops connecting as that
-- role. "saf" remains the migration-owning role; "saf_app" is what every
-- repository's connection pool uses.
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'saf_app') THEN
    CREATE ROLE saf_app LOGIN PASSWORD 'saf_app_dev_password';
  END IF;
END
$$;

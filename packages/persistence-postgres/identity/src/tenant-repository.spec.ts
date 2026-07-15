import { randomUUID } from "node:crypto";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { Tenant } from "@sap-app-factory/context-identity";
import { repositoryContractTests } from "@sap-app-factory/testing-kit";
import { TenantRepository } from "./tenant-repository.js";

/**
 * Real Postgres integration tests, gated behind SAF_TEST_POSTGRES_URL —
 * same convention as events-adapters/postgres-outbox. See that package's
 * spec file header for how to point this at a throwaway container.
 *
 * Two connections, deliberately: `adminPool` (the superuser role that owns
 * the migration) for schema setup and any check that must see the ground
 * truth regardless of RLS, and `appPool` (the non-superuser `saf_app` role —
 * see infra/docker-compose/postgres-init/01-create-app-role.sql) for the
 * repository itself and every RLS-sensitive assertion. A Postgres superuser
 * bypasses RLS unconditionally — running RLS assertions against `adminPool`
 * would silently pass for the wrong reason, which is exactly the bug this
 * package's README documents finding.
 */
const adminConnectionString = process.env.SAF_TEST_POSTGRES_URL;
const appConnectionString = process.env.SAF_TEST_POSTGRES_APP_URL;

describe.skipIf(!adminConnectionString || !appConnectionString)(
  "TenantRepository (requires SAF_TEST_POSTGRES_URL and SAF_TEST_POSTGRES_APP_URL)",
  () => {
    let adminPool: Pool;
    let appPool: Pool;

    beforeAll(async () => {
      adminPool = new Pool({ connectionString: adminConnectionString });
      appPool = new Pool({ connectionString: appConnectionString });
      // A distinct migrationsTable per package, not drizzle's shared default
      // ("drizzle"."__drizzle_migrations") — a real bug found while wiring
      // SAF-15's CI pipeline: with the default (unscoped) tracking table,
      // running this package's migrate() after another persistence-postgres/*
      // package's already-applied-migration count made this package's
      // migrator think its own migrations were already applied (a naive
      // row-count comparison, not a genuine per-file check) and silently
      // skip them — this schema was simply never created. (A custom
      // migrationsSchema instead of migrationsTable was tried first and
      // rejected: drizzle's own schema-bootstrap step collides with this
      // package's migration files, which already do their own unconditional
      // `CREATE SCHEMA "identity"`.) See the governance package's identical
      // fix and comment.
      await migrate(drizzle(adminPool), {
        migrationsFolder: "./migrations",
        migrationsTable: "identity_migrations",
      });
    });

    afterAll(async () => {
      await adminPool.end();
      await appPool.end();
    });

    beforeEach(async () => {
      await adminPool.query('TRUNCATE TABLE "identity"."tenants"');
    });

    repositoryContractTests<Tenant, string>(() => new TenantRepository(appPool), {
      makeId: () => `tenant-${randomUUID()}`,
      buildAggregate: (id) => ({ id, name: `Acme ${id}`, status: "active" }),
      mutateAggregate: (tenant) => ({ ...tenant, status: "suspended" }),
      toComparable: (tenant) => tenant,
    });

    it("denies access when app.tenant_id was never set for the session (fail-closed)", async () => {
      // Insert as admin, bypassing the repository's own scoped transaction,
      // so this row exists independent of any session variable.
      await adminPool.query(
        'INSERT INTO "identity"."tenants" (id, tenant_id, name, status) VALUES ($1, $1, $2, $3)',
        ["tenant-fail-closed", "Acme", "active"],
      );

      const client = await appPool.connect();
      try {
        const { rows } = await client.query('SELECT * FROM "identity"."tenants" WHERE id = $1', [
          "tenant-fail-closed",
        ]);
        // No app.tenant_id was ever set on this connection — RLS must deny, not
        // silently return the row just because no policy input was supplied.
        expect(rows).toHaveLength(0);
      } finally {
        client.release();
      }
    });

    it("FORCE ROW LEVEL SECURITY applies even on the migration-owning role", async () => {
      const { rows } = await adminPool.query<{ relforcerowsecurity: boolean }>(
        `SELECT relforcerowsecurity FROM pg_class WHERE oid = 'identity.tenants'::regclass`,
      );
      expect(rows[0]?.relforcerowsecurity).toBe(true);
    });

    it("the app role cannot bypass RLS even though it is not the table owner", async () => {
      const { rows } = await appPool.query<{ rolsuper: boolean; rolbypassrls: boolean }>(
        `SELECT rolsuper, rolbypassrls FROM pg_roles WHERE rolname = 'saf_app'`,
      );
      expect(rows[0]).toEqual({ rolsuper: false, rolbypassrls: false });
    });
  },
);

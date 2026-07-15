import { randomUUID } from "node:crypto";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { AuditEvent } from "@sap-app-factory/context-governance";
import { repositoryContractTests } from "@sap-app-factory/testing-kit";
import { AuditEventRepository } from "./audit-event-repository.js";

/**
 * Real Postgres integration tests, gated behind SAF_TEST_POSTGRES_URL /
 * SAF_TEST_POSTGRES_APP_URL — same convention as
 * persistence-postgres/identity (see that package's README for why two
 * connections, and events-adapters/postgres-outbox for how to point these
 * at a throwaway container).
 */
const adminConnectionString = process.env.SAF_TEST_POSTGRES_URL;
const appConnectionString = process.env.SAF_TEST_POSTGRES_APP_URL;

describe.skipIf(!adminConnectionString || !appConnectionString)(
  "AuditEventRepository (requires SAF_TEST_POSTGRES_URL and SAF_TEST_POSTGRES_APP_URL)",
  () => {
    let adminPool: Pool;
    let appPool: Pool;

    beforeAll(async () => {
      adminPool = new Pool({ connectionString: adminConnectionString });
      appPool = new Pool({ connectionString: appConnectionString });
      // A distinct migrationsTable per package, not drizzle's shared default
      // ("drizzle"."__drizzle_migrations") — a real bug found while wiring
      // SAF-15's CI pipeline: with the default (unscoped) tracking table,
      // running persistence-postgres/identity's migrate() first (also fixed
      // the same way) left 4 rows in that shared table; this package's own
      // migrate() call then compared its 2-migration journal against that
      // unrelated count, concluded (wrongly) that it had nothing left to
      // apply, and silently never created the "governance" schema at all —
      // no thrown error, migrate() just resolved having done nothing. (A
      // custom migrationsSchema instead of migrationsTable was tried first
      // and rejected: drizzle's own schema-bootstrap step collides with this
      // package's migration files, which already do their own unconditional
      // `CREATE SCHEMA "governance"`.)
      await migrate(drizzle(adminPool), {
        migrationsFolder: "./migrations",
        migrationsTable: "governance_migrations",
      });
    });

    afterAll(async () => {
      await adminPool.end();
      await appPool.end();
    });

    beforeEach(async () => {
      await adminPool.query('TRUNCATE TABLE "governance"."audit_events"');
    });

    repositoryContractTests<AuditEvent, string>(() => new AuditEventRepository(appPool), {
      makeId: () => `audit-${randomUUID()}`,
      buildAggregate: (id, ctx) => ({
        id,
        tenantId: ctx.tenantId,
        actorId: ctx.actorId,
        action: "workflow.run.started",
        occurredAt: "2026-07-14T00:00:00.000Z",
      }),
      // No mutateAggregate: AuditEvent is append-only by design (no update
      // path exists on the domain type either) — the shared contract
      // asserts idempotent re-save instead when this is omitted.
      toComparable: (event) => event,
    });

    it("is a genuinely partitioned table (not a plain table with a similar name)", async () => {
      const { rows } = await adminPool.query<{ partition_count: number }>(
        `SELECT count(*)::int AS partition_count
         FROM pg_inherits
         WHERE inhparent = 'governance.audit_events'::regclass`,
      );
      expect(rows[0]?.partition_count).toBeGreaterThanOrEqual(3);
    });

    it("routes a row into the partition matching its created_at (the partition key, not occurred_at)", async () => {
      // Partitioning is keyed on `created_at` (write time), never
      // `occurred_at` (business time) — inserted directly with an explicit
      // `created_at` to test the partitioning mechanism itself, independent
      // of the repository always using `now()` for that column.
      const id = `audit-${randomUUID()}`;
      await adminPool.query(
        `INSERT INTO "governance"."audit_events" (id, tenant_id, actor_id, action, occurred_at, created_at)
         VALUES ($1, 't1', 'u1', 'workflow.run.started', now(), '2026-08-15T00:00:00.000Z')`,
        [id],
      );

      const { rows } = await adminPool.query(
        `SELECT id FROM "governance"."audit_events_2026_08" WHERE id = $1`,
        [id],
      );
      expect(rows).toHaveLength(1);
    });

    it("fails closed for a write outside every existing partition, rather than silently misplacing it", async () => {
      const client = await adminPool.connect();
      try {
        await expect(
          client.query(
            `INSERT INTO "governance"."audit_events" (id, tenant_id, actor_id, action, occurred_at, created_at)
             VALUES ($1, 't1', 'u1', 'x', now(), $2)`,
            ["audit-out-of-range", "2030-01-01T00:00:00.000Z"],
          ),
        ).rejects.toThrow(/no partition of relation/);
      } finally {
        client.release();
      }
    });

    it("denies access when app.tenant_id was never set for the session (fail-closed)", async () => {
      await adminPool.query(
        `INSERT INTO "governance"."audit_events" (id, tenant_id, actor_id, action, occurred_at, created_at)
         VALUES ($1, 't1', 'u1', 'x', now(), now())`,
        ["audit-fail-closed"],
      );

      const client = await appPool.connect();
      try {
        const { rows } = await client.query(
          'SELECT * FROM "governance"."audit_events" WHERE id = $1',
          ["audit-fail-closed"],
        );
        expect(rows).toHaveLength(0);
      } finally {
        client.release();
      }
    });
  },
);

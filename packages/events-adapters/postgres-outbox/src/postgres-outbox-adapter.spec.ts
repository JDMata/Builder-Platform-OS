import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from "vitest";
import type { DomainEventEnvelope } from "@sap-app-factory/ports";
import { createTestRequestContext, eventBusContractTests } from "@sap-app-factory/testing-kit";
import { insertOutboxRow, PostgresOutboxAdapter } from "./postgres-outbox-adapter.js";

/**
 * Real integration tests against a live Postgres — no fake, no mock (the
 * Architecture Inventory Report flagged the llm/mcp adapters as "generic
 * fakes wearing a specific name"; this adapter does not repeat that). Gated
 * behind SAF_TEST_POSTGRES_URL/SAF_TEST_POSTGRES_APP_URL and skips (not
 * deletes, not fakes) itself when either isn't set. Point these at the
 * docker-compose stack (`pnpm infra:up`, SAF-13) or a throwaway container —
 * see events-adapters/postgres-outbox's README.
 *
 * Two connections, deliberately, matching persistence-postgres/identity's
 * convention: `adminPool` (the superuser role that owns the migration) for
 * `ensureSchema()` and ground-truth assertions, `appPool` (the non-superuser
 * `saf_app` role) for every `PostgresOutboxAdapter` actually under test.
 * This file originally (SAF-11) predated `saf_app`'s existence and ran
 * everything through one superuser connection — which is exactly why a real
 * permission bug (a missing GRANT on the `seq` column's sequence) shipped
 * unnoticed until `apps/worker` (SAF-6) hit it for the first time. Fixed
 * both the grant and this test file, so this class of bug can't recur
 * silently again.
 */
const adminConnectionString = process.env.SAF_TEST_POSTGRES_URL;
const appConnectionString = process.env.SAF_TEST_POSTGRES_APP_URL;

interface OutboxRow {
  readonly id: string;
  readonly data: unknown;
  readonly delivered_at: Date | null;
}

function testEvent(overrides: Partial<DomainEventEnvelope> = {}): DomainEventEnvelope {
  return {
    id: randomUUID(),
    type: "test.thing.happened.v1",
    source: "postgres-outbox-adapter.spec",
    time: new Date().toISOString(),
    tenantId: "tenant-1",
    correlationId: "corr-1",
    dataVersion: 1,
    data: {},
    ...overrides,
  };
}

describe.skipIf(!adminConnectionString || !appConnectionString)(
  "PostgresOutboxAdapter (requires SAF_TEST_POSTGRES_URL and SAF_TEST_POSTGRES_APP_URL)",
  () => {
    let adminPool: Pool;
    let appPool: Pool;
    let startedAdapters: PostgresOutboxAdapter[] = [];

    beforeAll(async () => {
      adminPool = new Pool({ connectionString: adminConnectionString });
      appPool = new Pool({ connectionString: appConnectionString });
      await new PostgresOutboxAdapter(adminPool).ensureSchema();
    });

    afterAll(async () => {
      await adminPool.end();
      await appPool.end();
    });

    beforeEach(async () => {
      await adminPool.query("TRUNCATE TABLE outbox.events");
    });

    afterEach(async () => {
      for (const adapter of startedAdapters) {
        await adapter.stop();
      }
      startedAdapters = [];
    });

    eventBusContractTests(async () => {
      const adapter = new PostgresOutboxAdapter(appPool, { pollIntervalMs: 50 });
      await adapter.start();
      startedAdapters.push(adapter);
      return adapter;
    });

    it("writes exactly one row per publish, round-tripping every envelope field", async () => {
      const adapter = new PostgresOutboxAdapter(appPool);
      const ctx = createTestRequestContext();
      const event = testEvent({
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        data: { amount: 42 },
      });

      await adapter.publish(ctx, event);

      const { rows } = await adminPool.query<OutboxRow>("SELECT * FROM outbox.events");
      expect(rows).toHaveLength(1);
      expect(rows[0]?.id).toBe(event.id);
      expect(rows[0]?.data).toEqual({ amount: 42 });
      expect(rows[0]?.delivered_at).toBeNull();
    });

    it("rolls back the outbox insert when the surrounding transaction is rolled back", async () => {
      const client = await appPool.connect();
      const event = testEvent({ type: "test.rollback.v1" });
      try {
        await client.query("BEGIN");
        await insertOutboxRow(client, event);
        await client.query("ROLLBACK");
      } finally {
        client.release();
      }

      const { rows } = await adminPool.query("SELECT * FROM outbox.events WHERE id = $1", [
        event.id,
      ]);
      expect(rows).toHaveLength(0);
    });

    it("delivers events in publish order (single-relay ordering guarantee)", async () => {
      const adapter = new PostgresOutboxAdapter(appPool);
      const ctx = createTestRequestContext();
      const received: number[] = [];
      adapter.subscribe("test.ordering.v1", (event) => {
        received.push((event.data as { seq: number }).seq);
        return Promise.resolve();
      });

      for (let seq = 0; seq < 5; seq += 1) {
        await adapter.publish(
          ctx,
          testEvent({
            type: "test.ordering.v1",
            tenantId: ctx.tenantId,
            correlationId: ctx.correlationId,
            data: { seq },
          }),
        );
      }
      await adapter.claimAndDispatch();

      expect(received).toEqual([0, 1, 2, 3, 4]);
    });

    it("marks an event delivered exactly once and does not redeliver it on the next relay pass", async () => {
      const adapter = new PostgresOutboxAdapter(appPool);
      const ctx = createTestRequestContext();
      let callCount = 0;
      adapter.subscribe("test.thing.happened.v1", () => {
        callCount += 1;
        return Promise.resolve();
      });

      await adapter.publish(
        ctx,
        testEvent({ tenantId: ctx.tenantId, correlationId: ctx.correlationId }),
      );
      await adapter.claimAndDispatch();
      await adapter.claimAndDispatch();

      expect(callCount).toBe(1);
    });

    it("leaves a crashed (uncommitted) claim available for redelivery, proving at-least-once delivery", async () => {
      const ctx = createTestRequestContext();
      const producer = new PostgresOutboxAdapter(appPool);
      const event = testEvent({
        type: "test.redelivery.v1",
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
      });
      await producer.publish(ctx, event);

      // Simulate a relay crashing after claiming the row but before committing
      // the delivered-mark: hold it locked in an open transaction, then abandon it.
      const crashedClient = await appPool.connect();
      await crashedClient.query("BEGIN");
      await crashedClient.query(
        "SELECT id FROM outbox.events WHERE id = $1 FOR UPDATE SKIP LOCKED",
        [event.id],
      );

      const duringCrash = await appPool.query(
        "SELECT id FROM outbox.events WHERE id = $1 AND delivered_at IS NULL FOR UPDATE SKIP LOCKED",
        [event.id],
      );
      expect(duringCrash.rows).toHaveLength(0); // a concurrent claim must skip the locked row

      await crashedClient.query("ROLLBACK"); // the "crash" — lock releases, delivered_at was never set
      crashedClient.release();

      const received: string[] = [];
      const consumer = new PostgresOutboxAdapter(appPool);
      consumer.subscribe("test.redelivery.v1", (delivered) => {
        received.push(delivered.id);
        return Promise.resolve();
      });
      await consumer.claimAndDispatch();

      expect(received).toEqual([event.id]);
    });
  },
);

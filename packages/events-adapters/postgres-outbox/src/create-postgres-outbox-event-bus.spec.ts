import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createTestRequestContext } from "@sap-app-factory/testing-kit";
import { createPostgresOutboxEventBus } from "./create-postgres-outbox-event-bus.js";

/**
 * Real-Postgres test for the composition-root bootstrap itself — gated the
 * same way as postgres-outbox-adapter.spec.ts. Exercises the exact path
 * apps/orchestrator and apps/worker call in production: admin pool runs
 * ensureSchema() and closes, the returned eventBus runs as saf_app.
 */
const adminConnectionString = process.env.SAF_TEST_POSTGRES_URL;
const appConnectionString = process.env.SAF_TEST_POSTGRES_APP_URL;

describe.skipIf(!adminConnectionString || !appConnectionString)(
  "createPostgresOutboxEventBus (requires SAF_TEST_POSTGRES_URL and SAF_TEST_POSTGRES_APP_URL)",
  () => {
    let stop: (() => Promise<void>) | undefined;

    afterEach(async () => {
      await stop?.();
      stop = undefined;
    });

    it("returns a started, working EventBusPort connected as the app role", async () => {
      const bootstrap = await createPostgresOutboxEventBus({
        adminConnectionString,
        appConnectionString,
      });
      stop = bootstrap.stop;

      const ctx = createTestRequestContext();
      const received: string[] = [];
      bootstrap.eventBus.subscribe("test.bootstrap.v1", (event) => {
        received.push(event.id);
        return Promise.resolve();
      });

      const eventId = randomUUID();
      await bootstrap.eventBus.publish(ctx, {
        id: eventId,
        type: "test.bootstrap.v1",
        source: "create-postgres-outbox-event-bus.spec",
        time: new Date().toISOString(),
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        dataVersion: 1,
        data: {},
      });

      await vi.waitFor(() => expect(received).toEqual([eventId]));
    });
  },
);

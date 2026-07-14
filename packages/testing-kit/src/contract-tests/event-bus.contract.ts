import { describe, expect, it, vi } from "vitest";
import type { DomainEventEnvelope, EventBusPort } from "@sap-app-factory/ports";
import { createTestRequestContext } from "../request-context.fixture.js";

/**
 * Any adapter behind EventBusPort must pass this suite. Delivery is
 * at-least-once (ADR-0007) — this only proves a published event reaches a
 * subscriber at least once within the timeout, never exactly-once.
 */
export function eventBusContractTests(
  createAdapter: () => EventBusPort | Promise<EventBusPort>,
): void {
  describe("EventBusPort contract", () => {
    it("a subscriber receives an event published for its event type", async () => {
      const adapter = await createAdapter();
      const ctx = createTestRequestContext();
      const received: DomainEventEnvelope[] = [];

      adapter.subscribe("test.thing.happened.v1", (event) => {
        received.push(event);
        return Promise.resolve();
      });

      await adapter.publish(ctx, {
        id: "evt-1",
        type: "test.thing.happened.v1",
        source: "contract-test",
        time: new Date().toISOString(),
        tenantId: ctx.tenantId,
        correlationId: ctx.correlationId,
        dataVersion: 1,
        data: { ok: true },
      });

      await vi.waitFor(() => expect(received).toHaveLength(1));
      expect(received[0]?.type).toBe("test.thing.happened.v1");
    });
  });
}

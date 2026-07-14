import { describe, expect, it, vi } from "vitest";
import type { DomainEventEnvelope } from "@sap-app-factory/ports";
import { SubscriberRegistry } from "./subscriber-registry.js";

function envelope(overrides: Partial<DomainEventEnvelope> = {}): DomainEventEnvelope {
  return {
    id: "evt-1",
    type: "test.thing.happened.v1",
    source: "subscriber-registry.spec",
    time: new Date().toISOString(),
    tenantId: "tenant-1",
    correlationId: "corr-1",
    dataVersion: 1,
    data: {},
    ...overrides,
  };
}

describe("SubscriberRegistry", () => {
  it("dispatches an event to every handler registered for its type", async () => {
    const registry = new SubscriberRegistry();
    const first = vi.fn().mockResolvedValue(undefined);
    const second = vi.fn().mockResolvedValue(undefined);
    registry.subscribe("test.thing.happened.v1", first);
    registry.subscribe("test.thing.happened.v1", second);

    await registry.dispatch(envelope());

    expect(first).toHaveBeenCalledTimes(1);
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("does not call handlers registered for a different event type", async () => {
    const registry = new SubscriberRegistry();
    const handler = vi.fn().mockResolvedValue(undefined);
    registry.subscribe("test.other.v1", handler);

    await registry.dispatch(envelope());

    expect(handler).not.toHaveBeenCalled();
  });

  it("resolves without error when no handler is registered for the event type", async () => {
    const registry = new SubscriberRegistry();
    await expect(registry.dispatch(envelope())).resolves.toBeUndefined();
  });

  it("runs every handler even when one rejects, then throws so the caller knows delivery failed", async () => {
    const registry = new SubscriberRegistry();
    const succeeds = vi.fn().mockResolvedValue(undefined);
    const fails = vi.fn().mockRejectedValue(new Error("handler blew up"));
    registry.subscribe("test.thing.happened.v1", fails);
    registry.subscribe("test.thing.happened.v1", succeeds);

    await expect(registry.dispatch(envelope())).rejects.toThrow(AggregateError);
    expect(succeeds).toHaveBeenCalledTimes(1);
  });
});

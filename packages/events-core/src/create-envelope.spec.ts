import { describe, expect, it } from "vitest";
import { createTestRequestContext } from "@sap-app-factory/testing-kit";
import { createEnvelope } from "./create-envelope.js";

describe("createEnvelope", () => {
  it("fills in id/time/tenantId/correlationId from the request context", () => {
    const ctx = createTestRequestContext();

    const envelope = createEnvelope(ctx, {
      type: "test.thing.happened.v1",
      source: "create-envelope.spec",
      dataVersion: 1,
      data: { amount: 42 },
    });

    expect(envelope.id).toEqual(expect.any(String));
    expect(envelope.id.length).toBeGreaterThan(0);
    expect(() => new Date(envelope.time).toISOString()).not.toThrow();
    expect(envelope.tenantId).toBe(ctx.tenantId);
    expect(envelope.correlationId).toBe(ctx.correlationId);
    expect(envelope.type).toBe("test.thing.happened.v1");
    expect(envelope.data).toEqual({ amount: 42 });
  });

  it("generates a distinct id for every call", () => {
    const ctx = createTestRequestContext();
    const input = { type: "test.thing.happened.v1", source: "spec", dataVersion: 1, data: {} };

    const a = createEnvelope(ctx, input);
    const b = createEnvelope(ctx, input);

    expect(a.id).not.toBe(b.id);
  });
});

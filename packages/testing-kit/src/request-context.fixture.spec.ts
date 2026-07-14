import { describe, expect, it } from "vitest";
import { createTestRequestContext } from "./request-context.fixture.js";

describe("createTestRequestContext", () => {
  it("produces a distinct tenant/actor/correlation id on each call", () => {
    const first = createTestRequestContext();
    const second = createTestRequestContext();

    expect(first.tenantId).not.toBe(second.tenantId);
    expect(first.correlationId).not.toBe(second.correlationId);
  });

  it("defaults tenancyTier to pooled and honors overrides", () => {
    expect(createTestRequestContext().tenancyTier).toBe("pooled");
    expect(createTestRequestContext({ tenancyTier: "dedicated" }).tenancyTier).toBe("dedicated");
  });

  it("honors an explicit tenantId override", () => {
    const ctx = createTestRequestContext({ tenantId: "fixed-tenant" });
    expect(ctx.tenantId).toBe("fixed-tenant");
  });
});

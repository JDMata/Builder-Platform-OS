import { describe, expect, it } from "vitest";
import type { RequestContext } from "@sap-app-factory/ports";
import { correlationFromRequestContext } from "./correlation.js";

const ctx: RequestContext = {
  tenantId: "tenant-1",
  actorId: "actor-1",
  correlationId: "corr-1",
  tenancyTier: "pooled",
};

describe("correlationFromRequestContext", () => {
  it("maps tenantId/actorId/correlationId, dropping tenancyTier", () => {
    const result = correlationFromRequestContext(ctx);
    expect(result).toEqual({
      correlationId: "corr-1",
      tenantId: "tenant-1",
      actorId: "actor-1",
    });
    expect(result).not.toHaveProperty("tenancyTier");
  });

  it("attaches extra workflow/execution/project ids when provided", () => {
    const result = correlationFromRequestContext(ctx, { executionId: "job-1" });
    expect(result.executionId).toBe("job-1");
    expect(result.workflowId).toBeUndefined();
    expect(result.projectId).toBeUndefined();
  });
});

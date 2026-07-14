import type { RequestContext } from "@sap-app-factory/ports";

let counter = 0;

/** A deterministic-enough RequestContext for tests — override any field as needed. */
export function createTestRequestContext(overrides: Partial<RequestContext> = {}): RequestContext {
  counter += 1;
  return {
    tenantId: `test-tenant-${counter}`,
    actorId: `test-actor-${counter}`,
    correlationId: `test-correlation-${counter}`,
    tenancyTier: "pooled",
    ...overrides,
  };
}

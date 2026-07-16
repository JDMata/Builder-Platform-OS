import { describe, expect, it } from "vitest";
import type { CapabilityResolverPort } from "@sap-app-factory/ports";
import { createTestRequestContext } from "../request-context.fixture.js";

/**
 * Any adapter behind `CapabilityResolverPort` must pass this suite — see
 * ADR-0022 and docs/architecture/18-capability-model.md. First real
 * adapter: `capability-registry-adapters/in-memory` (VS-1, Sprint 1).
 */
export interface CapabilityResolverContractFixtures {
  /** A capability id with at least one registered provider. */
  registeredCapabilityId: string;
  /** A capability id with no registered provider at all. */
  unregisteredCapabilityId: string;
  readonly expectedProviderId: string;
}

export function capabilityResolverContractTests(
  createResolver: () => CapabilityResolverPort | Promise<CapabilityResolverPort>,
  fixtures: CapabilityResolverContractFixtures,
): void {
  describe("CapabilityResolverPort contract", () => {
    it("resolves a registered capability to its (highest-priority) provider", async () => {
      const resolver = await createResolver();
      const ctx = createTestRequestContext();

      const resolved = await resolver.resolve(ctx, fixtures.registeredCapabilityId);

      expect(resolved.providerId).toBe(fixtures.expectedProviderId);
    });

    it("fails clearly, rather than returning undefined, for an unregistered capability", async () => {
      const resolver = await createResolver();
      const ctx = createTestRequestContext();

      await expect(resolver.resolve(ctx, fixtures.unregisteredCapabilityId)).rejects.toThrow();
    });
  });
}

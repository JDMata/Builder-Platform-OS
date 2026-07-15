import { describe, expect, it } from "vitest";
import type { PolicyEnginePort } from "@sap-app-factory/ports";
import { createTestRequestContext } from "../request-context.fixture.js";

/**
 * Any adapter behind PolicyEnginePort must pass this suite (ADR-0011).
 * Deliberately minimal — policy *semantics* are bundle-specific (what's
 * allowed depends on the loaded policy, not on the port), so this only
 * asserts what's true regardless of bundle content: the result shape, and
 * fail-closed behavior for a request no policy bundle could plausibly grant.
 */
export function policyEngineContractTests(
  createAdapter: () => PolicyEnginePort | Promise<PolicyEnginePort>,
): void {
  describe("PolicyEnginePort contract", () => {
    it("returns a PolicyEvaluationResult with a boolean allowed field", async () => {
      const adapter = await createAdapter();
      const ctx = createTestRequestContext();

      const result = await adapter.evaluate(ctx, {
        resource: "test-resource",
        action: "test-action",
      });

      expect(typeof result.allowed).toBe("boolean");
    });

    it("denies by default for a request no policy bundle grants (fail-closed)", async () => {
      const adapter = await createAdapter();
      const ctx = createTestRequestContext();

      const result = await adapter.evaluate(ctx, {
        resource: "nonexistent-resource-xyz",
        action: "nonexistent-action-xyz",
      });

      expect(result.allowed).toBe(false);
    });
  });
}

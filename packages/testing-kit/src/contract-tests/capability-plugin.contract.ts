import { describe, expect, it } from "vitest";
import type { CapabilityPlugin } from "@sap-app-factory/plugin-sdk";
import { createTestRequestContext } from "../request-context.fixture.js";

/**
 * Any implementation of CapabilityPlugin must pass this suite (ADR-0006,
 * docs/architecture/05-plugin-architecture.md § Sprint 0 deliverable). This
 * is deliberately generic — it knows nothing about what a plugin generates,
 * only that the lifecycle contract itself is honored.
 */
export function capabilityPluginContractTests(
  createPlugin: () => CapabilityPlugin | Promise<CapabilityPlugin>,
): void {
  describe("CapabilityPlugin contract", () => {
    it("declares a manifest with a non-empty id and a version >= 1", async () => {
      const plugin = await createPlugin();

      expect(plugin.manifest.id.length).toBeGreaterThan(0);
      expect(plugin.manifest.version).toBeGreaterThanOrEqual(1);
    });

    it("declares at least one produced artifact type and one supported execution profile", async () => {
      const plugin = await createPlugin();

      expect(plugin.manifest.producesArtifactTypes.length).toBeGreaterThan(0);
      expect(plugin.manifest.supportedExecutionProfiles.length).toBeGreaterThan(0);
    });

    it("activate() then deactivate() resolve without throwing", async () => {
      const plugin = await createPlugin();
      const ctx = createTestRequestContext();

      await expect(plugin.activate(ctx)).resolves.toBeUndefined();
      await expect(plugin.deactivate()).resolves.toBeUndefined();
    });

    it("validate() returns a ValidationResult shape", async () => {
      const plugin = await createPlugin();

      const result = plugin.validate({
        requirementRefs: [],
        targetEnvironmentRef: "test-env",
        targetExecutionProfile: plugin.manifest.supportedExecutionProfiles[0]!,
        parameters: {},
      });

      expect(typeof result.valid).toBe("boolean");
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it("generate() resolves to an array of GeneratedArtifact", async () => {
      const plugin = await createPlugin();

      const artifacts = await plugin.generate({
        requirementRefs: [],
        targetEnvironmentRef: "test-env",
        targetExecutionProfile: plugin.manifest.supportedExecutionProfiles[0]!,
        parameters: {},
      });

      expect(Array.isArray(artifacts)).toBe(true);
    });
  });
}

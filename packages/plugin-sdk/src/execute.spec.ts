import { describe, expect, it } from "vitest";
import type { CapabilityPlugin, PluginActivationContext } from "./capability-plugin.js";
import type { GenerationInput, ValidationResult } from "./generation-input.js";
import type { GeneratedArtifact } from "./generated-artifact.js";
import type { PluginManifest } from "./plugin-manifest.js";
import { execute, PluginValidationError } from "./execute.js";

const ctx: PluginActivationContext = {
  tenantId: "t1",
  actorId: "u1",
  correlationId: "c1",
  tenancyTier: "pooled",
};

const input: GenerationInput = {
  requirementRefs: [],
  targetEnvironmentRef: "test-env",
  targetExecutionProfile: "local-poc",
  parameters: {},
};

const manifest: PluginManifest = {
  id: "test-plugin",
  version: 1,
  displayName: "Test Plugin",
  producesArtifactTypes: ["test-artifact"],
  requiredMcpCapabilities: [],
  requiredLlmCapabilities: [],
  requiredPermissions: [],
  supportedExecutionProfiles: ["local-poc"],
  portCategoriesUsed: [],
};

class RecordingPlugin implements CapabilityPlugin {
  readonly manifest = manifest;
  readonly calls: string[] = [];
  validationResult: ValidationResult = { valid: true, errors: [] };
  generateResult: readonly GeneratedArtifact[] = [];
  generateShouldThrow = false;

  activate(_ctx: PluginActivationContext): Promise<void> {
    this.calls.push("activate");
    return Promise.resolve();
  }

  validate(_input: GenerationInput): ValidationResult {
    this.calls.push("validate");
    return this.validationResult;
  }

  generate(_input: GenerationInput): Promise<readonly GeneratedArtifact[]> {
    this.calls.push("generate");
    if (this.generateShouldThrow) {
      return Promise.reject(new Error("generate failed"));
    }
    return Promise.resolve(this.generateResult);
  }

  deactivate(): Promise<void> {
    this.calls.push("deactivate");
    return Promise.resolve();
  }
}

describe("execute", () => {
  it("drives the full lifecycle in order: activate, validate, generate, deactivate", async () => {
    const plugin = new RecordingPlugin();

    await execute(plugin, ctx, input);

    expect(plugin.calls).toEqual(["activate", "validate", "generate", "deactivate"]);
  });

  it("returns whatever generate() produces", async () => {
    const plugin = new RecordingPlugin();
    const artifacts: GeneratedArtifact[] = [
      { artifactType: "test-artifact", content: {}, generatedForExecutionProfile: "local-poc" },
    ];
    plugin.generateResult = artifacts;

    const result = await execute(plugin, ctx, input);

    expect(result).toBe(artifacts);
  });

  it("throws PluginValidationError and never calls generate() when validation fails", async () => {
    const plugin = new RecordingPlugin();
    plugin.validationResult = { valid: false, errors: ["missing field"] };

    await expect(execute(plugin, ctx, input)).rejects.toThrow(PluginValidationError);
    expect(plugin.calls).toEqual(["activate", "validate", "deactivate"]);
  });

  it("still calls deactivate() when validation fails", async () => {
    const plugin = new RecordingPlugin();
    plugin.validationResult = { valid: false, errors: ["bad input"] };

    await expect(execute(plugin, ctx, input)).rejects.toThrow(/bad input/);
    expect(plugin.calls).toContain("deactivate");
  });

  it("still calls deactivate() when generate() throws", async () => {
    const plugin = new RecordingPlugin();
    plugin.generateShouldThrow = true;

    await expect(execute(plugin, ctx, input)).rejects.toThrow("generate failed");
    expect(plugin.calls).toEqual(["activate", "validate", "generate", "deactivate"]);
  });
});

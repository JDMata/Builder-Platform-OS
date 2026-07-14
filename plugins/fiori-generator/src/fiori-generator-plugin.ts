import type {
  CapabilityPlugin,
  GeneratedArtifact,
  GenerationInput,
  PluginActivationContext,
  PluginManifest,
  ValidationResult,
} from "@sap-app-factory/plugin-sdk";

/**
 * Sprint 0 stub — the manifest is real, but `generate()` returns `[]` and no
 * Fiori/SAPUI5 generation logic exists yet. See ADR-0006 and
 * docs/architecture/05-plugin-architecture.md § Sprint 0 deliverable: this
 * package exists to prove the `CapabilityPlugin` contract holds together end
 * to end, not to generate anything real.
 */
export class FioriGeneratorPlugin implements CapabilityPlugin {
  readonly manifest: PluginManifest = {
    id: "fiori-generator",
    version: 1,
    displayName: "Fiori Elements Generator",
    producesArtifactTypes: ["fiori-elements-app"],
    requiredMcpCapabilities: [],
    requiredLlmCapabilities: [],
    requiredPermissions: [],
    supportedExecutionProfiles: ["local-poc"],
    portCategoriesUsed: ["persistence", "authentication", "authorization"],
  };

  activate(_ctx: PluginActivationContext): Promise<void> {
    return Promise.resolve();
  }

  validate(_input: GenerationInput): ValidationResult {
    return { valid: true, errors: [] };
  }

  generate(_input: GenerationInput): Promise<readonly GeneratedArtifact[]> {
    return Promise.resolve([]);
  }

  deactivate(): Promise<void> {
    return Promise.resolve();
  }
}

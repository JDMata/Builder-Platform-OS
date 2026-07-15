import type {
  CapabilityPlugin,
  GeneratedArtifact,
  GenerationInput,
  PluginActivationContext,
  PluginManifest,
  ValidationResult,
} from "@sap-app-factory/plugin-sdk";

/**
 * Sprint 0 stub — the manifest is real, but `generate()` returns one fixed
 * placeholder `GeneratedArtifact` and no Fiori/SAPUI5 generation logic exists
 * yet. See ADR-0006 and docs/architecture/05-plugin-architecture.md § Sprint
 * 0 deliverable: this package exists to prove the `CapabilityPlugin`
 * contract holds together end to end, not to generate anything real. The
 * placeholder output (SAF-21) exists so a caller has a real
 * `GeneratedArtifact` to convert into a persisted `Artifact` — `generate()`
 * returning `[]` gave the Sprint 0 vertical-slice demo nothing to convert.
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

  generate(input: GenerationInput): Promise<readonly GeneratedArtifact[]> {
    return Promise.resolve([
      {
        artifactType: "fiori-elements-app",
        content: { message: "Sprint 0 placeholder — no real Fiori generation logic yet" },
        generatedForExecutionProfile: input.targetExecutionProfile,
      },
    ]);
  }

  deactivate(): Promise<void> {
    return Promise.resolve();
  }
}

import type { ArtifactType } from "./artifact-type.js";
import type { ExecutionProfileId, PortCategory } from "./execution-profile.js";

/**
 * `requiredMcpCapabilities`/`requiredLlmCapabilities`/`requiredPermissions`
 * are opaque identifiers (a `ToolBindingRef`-shaped string, a `ModelProfile`
 * name, a permission scope name respectively) — none of these registries
 * are built as code yet (see docs/architecture/05-plugin-architecture.md),
 * so this manifest references them the same way `ArtifactType`/`PortCategory`
 * are referenced: as plain strings the core never interprets, only carries.
 */
export interface PluginManifest {
  readonly id: string;
  readonly version: number;
  readonly displayName: string;
  readonly producesArtifactTypes: readonly ArtifactType[];
  readonly requiredMcpCapabilities: readonly string[];
  readonly requiredLlmCapabilities: readonly string[];
  readonly requiredPermissions: readonly string[];
  readonly supportedExecutionProfiles: readonly ExecutionProfileId[];
  readonly portCategoriesUsed: readonly PortCategory[];
}

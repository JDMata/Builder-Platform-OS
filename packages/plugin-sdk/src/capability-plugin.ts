import type { RequestContext } from "@sap-app-factory/ports";
import type { GeneratedArtifact } from "./generated-artifact.js";
import type { GenerationInput, ValidationResult } from "./generation-input.js";
import type { PluginManifest } from "./plugin-manifest.js";

/**
 * Sprint 0: an alias for `RequestContext`, nothing more. The "scoped
 * capability token" a real plugin invocation carries (docs/architecture/
 * 05-plugin-architecture.md § Isolation & Zero Trust) is a loader-time
 * concern — the loader and process/container isolation are explicitly
 * Sprint 1/2 work (ADR-0006's review update), not part of this contract yet.
 */
export type PluginActivationContext = RequestContext;

/**
 * The contract every SAP-specific capability plugin implements — see ADR-0006
 * and docs/architecture/05-plugin-architecture.md. Core orchestration code
 * never imports a concrete implementation of this interface; it only ever
 * goes through the Capability & Plugin Registry and, eventually, a plugin
 * loader (`orchestrator`, not yet built).
 */
export interface CapabilityPlugin {
  readonly manifest: PluginManifest;
  activate(ctx: PluginActivationContext): Promise<void>;
  validate(input: GenerationInput): ValidationResult;
  generate(input: GenerationInput): Promise<readonly GeneratedArtifact[]>;
  deactivate(): Promise<void>;
}

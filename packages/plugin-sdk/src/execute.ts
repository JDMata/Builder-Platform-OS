import type { CapabilityPlugin, PluginActivationContext } from "./capability-plugin.js";
import type { GenerationInput } from "./generation-input.js";
import type { GeneratedArtifact } from "./generated-artifact.js";

/** Thrown by `execute()` when a plugin's own `validate()` reports the input invalid. */
export class PluginValidationError extends Error {
  constructor(public readonly errors: readonly string[]) {
    super(`Plugin input validation failed: ${errors.join("; ")}`);
    this.name = "PluginValidationError";
  }
}

/**
 * The host-runner seam docs/architecture/05-plugin-architecture.md § Isolation
 * & Zero Trust describes: Sprint 0 calls a plugin's lifecycle in-process,
 * directly, but every caller goes through this one function — never a
 * plugin's `generate()` directly — so introducing process/container-level
 * isolation later (Node `worker_threads`, a separate container per
 * execution) changes what happens *inside* `execute()`, never what a caller
 * (`apps/worker`) invokes.
 *
 * Drives the full lifecycle in order: `activate` → `validate` → `generate`
 * → `deactivate`. `deactivate()` always runs, even if validation fails or
 * `generate()` throws, via `finally` — a plugin that leaks whatever
 * `activate()` acquired because a later step failed is exactly the kind of
 * bug this seam exists to make structurally hard to write.
 */
export async function execute(
  plugin: CapabilityPlugin,
  ctx: PluginActivationContext,
  input: GenerationInput,
): Promise<readonly GeneratedArtifact[]> {
  await plugin.activate(ctx);
  try {
    const validation = plugin.validate(input);
    if (!validation.valid) {
      throw new PluginValidationError(validation.errors);
    }
    return await plugin.generate(input);
  } finally {
    await plugin.deactivate();
  }
}

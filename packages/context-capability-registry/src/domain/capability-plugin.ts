/**
 * The registry record for an installed plugin. Deliberately knows nothing
 * about what the plugin does — see ADR-0006: SAP-specific behavior lives only
 * inside the plugin implementation, never in this domain type.
 *
 * Naming collision, noted once so it isn't rediscovered as confusion later
 * (same discipline as `CapabilityProvider` vs. `CapabilityBinding`, see
 * 18-capability-model.md): this `CapabilityPlugin` (a registry record — id,
 * pluginId, version, status) is not `@sap-app-factory/plugin-sdk`'s
 * `CapabilityPlugin` (the lifecycle interface — manifest, activate/validate/
 * generate/deactivate — an installed plugin actually implements). One names
 * the row in the registry; the other names the contract the row points at.
 * Both predate this note using the same word for adjacent-but-different
 * concepts, in different packages that never import each other.
 */
export type CapabilityPluginStatus = "active" | "deprecated";

export interface CapabilityPlugin {
  readonly id: string;
  readonly pluginId: string;
  readonly version: number;
  readonly status: CapabilityPluginStatus;
}

export function registerCapabilityPlugin(input: {
  readonly id: string;
  readonly pluginId: string;
  readonly version: number;
}): CapabilityPlugin {
  if (input.version < 1) {
    throw new Error("CapabilityPlugin version must be >= 1");
  }
  return { id: input.id, pluginId: input.pluginId, version: input.version, status: "active" };
}

export function deprecateCapabilityPlugin(plugin: CapabilityPlugin): CapabilityPlugin {
  return { ...plugin, status: "deprecated" };
}

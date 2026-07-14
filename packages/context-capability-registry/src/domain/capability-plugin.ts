/**
 * The registry record for an installed plugin. Deliberately knows nothing
 * about what the plugin does — see ADR-0006: SAP-specific behavior lives only
 * inside the plugin implementation, never in this domain type.
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

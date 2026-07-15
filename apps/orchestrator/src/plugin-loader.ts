import type { CapabilityPlugin } from "@sap-app-factory/plugin-sdk";
import {
  defineCapability,
  registerCapabilityProvider,
  type Capability,
  type CapabilityProvider,
} from "@sap-app-factory/context-capability-registry";

export interface CapabilityProviderRegistration {
  readonly capability: Capability;
  readonly provider: CapabilityProvider;
}

/**
 * Sprint 0's plugin loader (05-plugin-architecture.md § Discovery & loading):
 * reads each plugin's manifest and registers it into the Capability & Plugin
 * Registry — one `Capability` per artifact type the plugin declares it
 * produces, with the plugin itself as that capability's (currently only)
 * `CapabilityProvider`. In-memory only: no `Capability`/`CapabilityProvider`
 * repository exists yet (SAF-14 built `Tenant`/`AuditEvent` persistence, not
 * this context's), so there is nothing to persist to — this proves the
 * *wiring*, not durable registration.
 */
export function registerPluginCapabilities(
  plugins: readonly CapabilityPlugin[],
): readonly CapabilityProviderRegistration[] {
  const registrations: CapabilityProviderRegistration[] = [];

  for (const plugin of plugins) {
    for (const artifactType of plugin.manifest.producesArtifactTypes) {
      const capability = defineCapability({
        id: `generate-${artifactType}`,
        name: `Generate ${artifactType}`,
        expectedArtifactTypes: [artifactType],
      });
      const provider = registerCapabilityProvider({
        id: `${plugin.manifest.id}-provides-${capability.id}`,
        capabilityId: capability.id,
        providerType: "plugin",
        providerId: plugin.manifest.id,
        providerVersion: plugin.manifest.version,
        priority: 1,
      });
      registrations.push({ capability, provider });
    }
  }

  return registrations;
}

import { describe, expect, it } from "vitest";
import { FioriGeneratorPlugin } from "@sap-app-factory/plugin-fiori-generator";
import { resolveCapabilityProvider } from "@sap-app-factory/context-capability-registry";
import { registerPluginCapabilities } from "./plugin-loader.js";

describe("registerPluginCapabilities", () => {
  it("registers one capability per produced artifact type, with the plugin as provider", () => {
    const plugin = new FioriGeneratorPlugin();

    const registrations = registerPluginCapabilities([plugin]);

    expect(registrations).toHaveLength(plugin.manifest.producesArtifactTypes.length);
    const [registration] = registrations;
    expect(registration?.capability.expectedArtifactTypes).toEqual([
      plugin.manifest.producesArtifactTypes[0],
    ]);
    expect(registration?.provider.providerType).toBe("plugin");
    expect(registration?.provider.providerId).toBe(plugin.manifest.id);
  });

  it("registers nothing for a plugin that produces no artifact types", () => {
    const registrations = registerPluginCapabilities([]);

    expect(registrations).toEqual([]);
  });

  it("the registered provider resolves as the sole (and therefore highest-priority) provider", () => {
    const plugin = new FioriGeneratorPlugin();
    const [registration] = registerPluginCapabilities([plugin]);

    const resolved = resolveCapabilityProvider([registration!.provider]);

    expect(resolved).toBe(registration!.provider);
  });
});

export { registerCapabilityPlugin, deprecateCapabilityPlugin } from "./domain/capability-plugin.js";
export type { CapabilityPlugin, CapabilityPluginStatus } from "./domain/capability-plugin.js";

export { defineCapability } from "./domain/capability.js";
export type { Capability } from "./domain/capability.js";

export {
  registerCapabilityProvider,
  resolveCapabilityProvider,
} from "./domain/capability-provider.js";
export type { CapabilityProvider, CapabilityProviderType } from "./domain/capability-provider.js";

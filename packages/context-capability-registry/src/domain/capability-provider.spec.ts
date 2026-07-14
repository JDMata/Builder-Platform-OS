import { describe, expect, it } from "vitest";
import { registerCapabilityProvider, resolveCapabilityProvider } from "./capability-provider.js";

describe("CapabilityProvider", () => {
  it("registers a provider for a capability", () => {
    const provider = registerCapabilityProvider({
      id: "cp1",
      capabilityId: "generate-functional-spec",
      providerType: "agent",
      providerId: "documentation-agent",
      providerVersion: 1,
      priority: 1,
    });

    expect(provider.providerType).toBe("agent");
    expect(provider.priority).toBe(1);
  });

  it("rejects providerVersion below 1", () => {
    expect(() =>
      registerCapabilityProvider({
        id: "cp1",
        capabilityId: "c1",
        providerType: "plugin",
        providerId: "fiori-generator",
        providerVersion: 0,
        priority: 1,
      }),
    ).toThrow(/providerVersion must be >= 1/);
  });

  it("rejects priority below 1", () => {
    expect(() =>
      registerCapabilityProvider({
        id: "cp1",
        capabilityId: "c1",
        providerType: "plugin",
        providerId: "fiori-generator",
        providerVersion: 1,
        priority: 0,
      }),
    ).toThrow(/priority must be >= 1/);
  });
});

describe("resolveCapabilityProvider", () => {
  it("picks the lowest-priority-number provider", () => {
    const fallback = registerCapabilityProvider({
      id: "cp2",
      capabilityId: "c1",
      providerType: "human",
      providerId: "consultant-pool",
      providerVersion: 1,
      priority: 2,
    });
    const primary = registerCapabilityProvider({
      id: "cp1",
      capabilityId: "c1",
      providerType: "agent",
      providerId: "documentation-agent",
      providerVersion: 1,
      priority: 1,
    });

    expect(resolveCapabilityProvider([fallback, primary])).toBe(primary);
  });

  it("throws when no provider is registered — a dead-end capability, not a silent undefined", () => {
    expect(() => resolveCapabilityProvider([])).toThrow(/No CapabilityProvider is registered/);
  });
});

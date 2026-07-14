import { describe, expect, it } from "vitest";
import { deprecateCapabilityPlugin, registerCapabilityPlugin } from "./capability-plugin.js";

describe("CapabilityPlugin", () => {
  it("registers active at version 1", () => {
    const plugin = registerCapabilityPlugin({ id: "cp1", pluginId: "fiori-generator", version: 1 });
    expect(plugin.status).toBe("active");
  });

  it("rejects a version below 1", () => {
    expect(() =>
      registerCapabilityPlugin({ id: "cp1", pluginId: "fiori-generator", version: 0 }),
    ).toThrow(/version must be >= 1/);
  });

  it("deprecates without mutating the original", () => {
    const plugin = registerCapabilityPlugin({ id: "cp1", pluginId: "fiori-generator", version: 1 });
    const deprecated = deprecateCapabilityPlugin(plugin);
    expect(deprecated.status).toBe("deprecated");
    expect(plugin.status).toBe("active");
  });
});

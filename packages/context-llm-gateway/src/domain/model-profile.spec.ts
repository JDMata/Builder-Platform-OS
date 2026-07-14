import { describe, expect, it } from "vitest";
import { createModelProfile, retireModelProfile } from "./model-profile.js";

describe("ModelProfile", () => {
  it("is created active with a logical name distinct from the concrete model", () => {
    const profile = createModelProfile({
      id: "mp1",
      name: "reasoning-large",
      provider: "anthropic",
      model: "claude-opus-4-8",
    });
    expect(profile.status).toBe("active");
    expect(profile.name).toBe("reasoning-large");
  });

  it("rejects an empty logical name", () => {
    expect(() =>
      createModelProfile({ id: "mp1", name: "", provider: "anthropic", model: "x" }),
    ).toThrow(/must not be empty/);
  });

  it("retires without mutating the original", () => {
    const profile = createModelProfile({
      id: "mp1",
      name: "reasoning-large",
      provider: "anthropic",
      model: "x",
    });
    const retired = retireModelProfile(profile);
    expect(retired.status).toBe("retired");
    expect(profile.status).toBe("active");
  });
});

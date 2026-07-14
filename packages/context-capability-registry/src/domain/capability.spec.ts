import { describe, expect, it } from "vitest";
import { defineCapability } from "./capability.js";

describe("Capability", () => {
  it("defines a capability with its expected artifact types", () => {
    const capability = defineCapability({
      id: "generate-functional-spec",
      name: "Generate Functional Specification",
      expectedArtifactTypes: ["functional-spec-doc"],
    });

    expect(capability.id).toBe("generate-functional-spec");
    expect(capability.expectedArtifactTypes).toEqual(["functional-spec-doc"]);
  });

  it("rejects an empty id", () => {
    expect(() => defineCapability({ id: "", name: "x", expectedArtifactTypes: ["a"] })).toThrow(
      /id must not be empty/,
    );
  });

  it("rejects an empty name", () => {
    expect(() => defineCapability({ id: "c1", name: "", expectedArtifactTypes: ["a"] })).toThrow(
      /name must not be empty/,
    );
  });

  it("rejects zero expected artifact types — a capability that expects nothing is meaningless", () => {
    expect(() => defineCapability({ id: "c1", name: "x", expectedArtifactTypes: [] })).toThrow(
      /at least one expected artifact type/,
    );
  });
});

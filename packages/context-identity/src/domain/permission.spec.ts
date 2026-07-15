import { describe, expect, it } from "vitest";
import { definePermission, permissionKey } from "./permission.js";

describe("Permission", () => {
  it("defines a resource:action permission", () => {
    const permission = definePermission({ id: "p1", resource: "workflow", action: "approve" });

    expect(permissionKey(permission)).toBe("workflow:approve");
  });

  it("rejects an empty resource", () => {
    expect(() => definePermission({ id: "p1", resource: " ", action: "approve" })).toThrow(
      /resource must not be empty/,
    );
  });

  it("rejects an empty action", () => {
    expect(() => definePermission({ id: "p1", resource: "workflow", action: "" })).toThrow(
      /action must not be empty/,
    );
  });
});

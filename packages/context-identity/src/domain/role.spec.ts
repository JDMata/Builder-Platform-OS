import { describe, expect, it } from "vitest";
import { defineRole, retireRole } from "./role.js";

describe("Role", () => {
  it("is defined active with its permission bundle", () => {
    const role = defineRole({ id: "r1", name: "DeliveryLead", permissionIds: ["p1", "p2"] });

    expect(role.status).toBe("active");
    expect(role.permissionIds).toEqual(["p1", "p2"]);
  });

  it("rejects an empty name", () => {
    expect(() => defineRole({ id: "r1", name: " ", permissionIds: [] })).toThrow(
      /name must not be empty/,
    );
  });

  it("retires without mutating the original", () => {
    const role = defineRole({ id: "r1", name: "DeliveryLead", permissionIds: [] });

    const retired = retireRole(role);

    expect(retired.status).toBe("retired");
    expect(role.status).toBe("active");
  });
});

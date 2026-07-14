import { describe, expect, it } from "vitest";
import { archiveTenant, createTenant, suspendTenant } from "./tenant.js";

describe("Tenant", () => {
  it("is created active", () => {
    const tenant = createTenant({ id: "t1", name: "Acme" });
    expect(tenant.status).toBe("active");
  });

  it("rejects an empty name", () => {
    expect(() => createTenant({ id: "t1", name: "  " })).toThrow(/must not be empty/);
  });

  it("suspend and archive transition status without mutating the original", () => {
    const tenant = createTenant({ id: "t1", name: "Acme" });

    const suspended = suspendTenant(tenant);
    expect(suspended.status).toBe("suspended");
    expect(tenant.status).toBe("active");

    const archived = archiveTenant(suspended);
    expect(archived.status).toBe("archived");
  });
});

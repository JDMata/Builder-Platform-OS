import { describe, expect, it } from "vitest";
import { archiveWorkspace, createWorkspace } from "./workspace.js";

describe("Workspace", () => {
  it("is created active, scoped to a tenant", () => {
    const workspace = createWorkspace({ id: "w1", tenantId: "t1", name: "Delivery Org" });
    expect(workspace.status).toBe("active");
    expect(workspace.tenantId).toBe("t1");
  });

  it("rejects an empty name", () => {
    expect(() => createWorkspace({ id: "w1", tenantId: "t1", name: "" })).toThrow(
      /must not be empty/,
    );
  });

  it("archives without mutating the original", () => {
    const workspace = createWorkspace({ id: "w1", tenantId: "t1", name: "Delivery Org" });
    const archived = archiveWorkspace(workspace);
    expect(archived.status).toBe("archived");
    expect(workspace.status).toBe("active");
  });
});

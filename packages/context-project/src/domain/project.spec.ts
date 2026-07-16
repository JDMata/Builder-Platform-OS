import { describe, expect, it } from "vitest";
import { createProject } from "./project.js";

describe("Project", () => {
  it("is created from an approved RequirementDocument reference", () => {
    const project = createProject({
      id: "p1",
      workspaceId: "w1",
      name: "Shift-End Stock Reconciliation",
      description: "Reconcile physical stock counts against SAP inventory at shift end.",
      sourceRequirementDocumentId: "d1",
    });
    expect(project.name).toBe("Shift-End Stock Reconciliation");
    expect(project.sourceRequirementDocumentId).toBe("d1");
  });

  it("rejects an empty name", () => {
    expect(() =>
      createProject({
        id: "p1",
        workspaceId: "w1",
        name: " ",
        description: "x",
        sourceRequirementDocumentId: "d1",
      }),
    ).toThrow(/must not be empty/);
  });

  it("rejects a missing source RequirementDocument reference", () => {
    expect(() =>
      createProject({
        id: "p1",
        workspaceId: "w1",
        name: "x",
        description: "x",
        sourceRequirementDocumentId: " ",
      }),
    ).toThrow(/RequirementDocument it was approved from/);
  });
});

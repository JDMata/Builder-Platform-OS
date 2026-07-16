import { describe, expect, it } from "vitest";
import {
  approveRequirementDocument,
  createRequirementDocument,
  suggestProjectName,
} from "./requirement-document.js";

describe("RequirementDocument", () => {
  it("is created draft, workspace-scoped, with no suggested name yet", () => {
    const document = createRequirementDocument({
      id: "d1",
      workspaceId: "w1",
      ideaText: "We need a way to reconcile stock counts",
    });
    expect(document.status).toBe("draft");
    expect(document.workspaceId).toBe("w1");
    expect(document.suggestedProjectName).toBe("");
  });

  it("rejects empty idea text", () => {
    expect(() => createRequirementDocument({ id: "d1", workspaceId: "w1", ideaText: " " })).toThrow(
      /must not be empty/,
    );
  });

  it("accepts a suggested project name without mutating the prior version", () => {
    const draft = createRequirementDocument({
      id: "d1",
      workspaceId: "w1",
      ideaText: "We need a way to reconcile stock counts",
    });
    const named = suggestProjectName(draft, "Shift-End Stock Reconciliation");
    expect(named.suggestedProjectName).toBe("Shift-End Stock Reconciliation");
    expect(draft.suggestedProjectName).toBe("");
  });

  it("rejects an empty suggested project name", () => {
    const draft = createRequirementDocument({
      id: "d1",
      workspaceId: "w1",
      ideaText: "x",
    });
    expect(() => suggestProjectName(draft, " ")).toThrow(/must not be empty/);
  });

  it("cannot be approved before a project name has been suggested", () => {
    const draft = createRequirementDocument({ id: "d1", workspaceId: "w1", ideaText: "x" });
    expect(() => approveRequirementDocument(draft)).toThrow(/no suggested project name/);
  });

  it("approves once a name has been suggested", () => {
    const draft = createRequirementDocument({ id: "d1", workspaceId: "w1", ideaText: "x" });
    const named = suggestProjectName(draft, "Shift-End Stock Reconciliation");
    const approved = approveRequirementDocument(named);
    expect(approved.status).toBe("approved");
    expect(named.status).toBe("draft");
  });
});

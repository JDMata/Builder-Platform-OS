import { describe, expect, it } from "vitest";
import { startWorkflowRun, transitionWorkflowRun } from "./workflow-run.js";

describe("WorkflowRun", () => {
  it("starts pending, pinned to a definition version", () => {
    const run = startWorkflowRun({
      id: "run1",
      workflowDefinitionId: "def1",
      workflowDefinitionVersion: 2,
    });
    expect(run.status).toBe("pending");
    expect(run.workflowDefinitionVersion).toBe(2);
  });

  it("rejects a definition version below 1", () => {
    expect(() =>
      startWorkflowRun({ id: "run1", workflowDefinitionId: "def1", workflowDefinitionVersion: 0 }),
    ).toThrow(/Version must be >= 1/);
  });

  it("transitions through running to completed", () => {
    const run = startWorkflowRun({
      id: "run1",
      workflowDefinitionId: "def1",
      workflowDefinitionVersion: 1,
    });
    const running = transitionWorkflowRun(run, "running");
    const completed = transitionWorkflowRun(running, "completed");
    expect(completed.status).toBe("completed");
  });

  it("never allows a transition out of a terminal status", () => {
    const run = startWorkflowRun({
      id: "run1",
      workflowDefinitionId: "def1",
      workflowDefinitionVersion: 1,
    });
    const cancelled = transitionWorkflowRun(run, "cancelled");
    expect(() => transitionWorkflowRun(cancelled, "running")).toThrow(/already terminal/);
  });
});

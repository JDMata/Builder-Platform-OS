import { describe, expect, it } from "vitest";
import type { Repository } from "@sap-app-factory/ports";
import { createTestRequestContext } from "@sap-app-factory/testing-kit";
import type { Project } from "../domain/project.js";
import { createProjectFromCapturedRequirements } from "./create-project-from-captured-requirements.js";

function fakeProjectRepository(): Repository<Project, string> & { saved: Project[] } {
  const saved: Project[] = [];
  return {
    saved,
    findById: (_ctx, id) => Promise.resolve(saved.find((p) => p.id === id)),
    save: (_ctx, project) => {
      saved.push(project);
      return Promise.resolve();
    },
  };
}

describe("createProjectFromCapturedRequirements", () => {
  it("creates and persists a Project from the captured-requirements event data", async () => {
    const projects = fakeProjectRepository();
    const project = await createProjectFromCapturedRequirements(
      createTestRequestContext(),
      { projects },
      {
        requirementDocumentId: "doc-1",
        workspaceId: "workspace-1",
        suggestedProjectName: "Shift-End Stock Reconciliation",
        ideaText: "We need a way to reconcile stock counts",
      },
      () => "proj-1",
    );

    expect(project.name).toBe("Shift-End Stock Reconciliation");
    expect(project.sourceRequirementDocumentId).toBe("doc-1");
    expect(projects.saved).toHaveLength(1);
  });
});

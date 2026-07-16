/**
 * The Discovery session's aggregate root — created from a Workspace-scoped
 * idea, structured by the `structure-business-requirement` capability into
 * `Requirement`s/`Clarification`s/`AcceptanceCriterion`s (each its own
 * aggregate, referenced by `requirementDocumentId`, never embedded — same
 * convention as `TargetSystemConnection` referencing `projectId`), and
 * approved into a `Project`. `suggestedProjectName` is set by the structuring
 * capability, never typed by hand on a wizard field (VS-1's Discovery-first
 * design, confirmed by the Product Design Review).
 */
export type RequirementDocumentStatus = "draft" | "approved";

export interface RequirementDocument {
  readonly id: string;
  readonly workspaceId: string;
  readonly ideaText: string;
  readonly suggestedProjectName: string;
  readonly status: RequirementDocumentStatus;
}

export function createRequirementDocument(input: {
  readonly id: string;
  readonly workspaceId: string;
  readonly ideaText: string;
}): RequirementDocument {
  if (input.ideaText.trim().length === 0) {
    throw new Error("Idea text must not be empty");
  }
  return {
    id: input.id,
    workspaceId: input.workspaceId,
    ideaText: input.ideaText,
    suggestedProjectName: "",
    status: "draft",
  };
}

export function suggestProjectName(
  document: RequirementDocument,
  suggestedProjectName: string,
): RequirementDocument {
  if (suggestedProjectName.trim().length === 0) {
    throw new Error("Suggested project name must not be empty");
  }
  return { ...document, suggestedProjectName };
}

export function approveRequirementDocument(document: RequirementDocument): RequirementDocument {
  if (document.suggestedProjectName.trim().length === 0) {
    throw new Error("Cannot approve a RequirementDocument with no suggested project name yet");
  }
  return { ...document, status: "approved" };
}

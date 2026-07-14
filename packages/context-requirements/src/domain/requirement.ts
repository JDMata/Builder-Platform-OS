/** See ADR-0021: a User Story is a `kind` of Requirement, not a separate aggregate. */
export type RequirementKind = "business" | "functional" | "non-functional" | "user-story";
export type RequirementStatus = "draft" | "approved" | "archived";

export interface Requirement {
  readonly id: string;
  readonly requirementDocumentId: string;
  readonly kind: RequirementKind;
  readonly description: string;
  readonly status: RequirementStatus;
}

export function createRequirement(input: {
  readonly id: string;
  readonly requirementDocumentId: string;
  readonly kind: RequirementKind;
  readonly description: string;
}): Requirement {
  if (input.description.trim().length === 0) {
    throw new Error("Requirement description must not be empty");
  }
  return {
    id: input.id,
    requirementDocumentId: input.requirementDocumentId,
    kind: input.kind,
    description: input.description,
    status: "draft",
  };
}

export function approveRequirement(requirement: Requirement): Requirement {
  return { ...requirement, status: "approved" };
}

export function archiveRequirement(requirement: Requirement): Requirement {
  return { ...requirement, status: "archived" };
}

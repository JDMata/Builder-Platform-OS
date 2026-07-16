/**
 * Created only as the outcome of an approved Discovery session (VS-1) — never
 * from an upfront "create project" form; see the Product Design Review's
 * "Create Project" reconciliation. `name` is the `RequirementDocument`'s
 * agent-derived `suggestedProjectName` at approval time, not a hand-typed
 * wizard field. Deliberately excludes `requiredExecutionProfiles` and any
 * other field only a later sprint's generation work needs (per
 * ENGINEERING_PRINCIPLES.md's "horizontal work only when the active slice
 * needs it").
 */
export interface Project {
  readonly id: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly description: string;
  readonly sourceRequirementDocumentId: string;
}

export function createProject(input: {
  readonly id: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly description: string;
  readonly sourceRequirementDocumentId: string;
}): Project {
  if (input.name.trim().length === 0) {
    throw new Error("Project name must not be empty");
  }
  if (input.sourceRequirementDocumentId.trim().length === 0) {
    throw new Error("Project must reference the RequirementDocument it was approved from");
  }
  return {
    id: input.id,
    workspaceId: input.workspaceId,
    name: input.name,
    description: input.description,
    sourceRequirementDocumentId: input.sourceRequirementDocumentId,
  };
}

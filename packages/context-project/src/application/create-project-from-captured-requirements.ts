import type { Repository, RequestContext } from "@sap-app-factory/ports";
import { createProject, type Project } from "../domain/project.js";

/**
 * The `requirements.document.captured.v1` event's data shape, re-declared
 * here rather than imported from `context-requirements` — cross-context
 * application-layer imports aren't allowed (the `application-no-cross-context`
 * dependency-cruiser rule; cross-context communication is event-only, ADR-0007).
 * The two are free to diverge, same rationale already used for
 * `CapabilityProviderType` (context-capability-registry vs. `ports`).
 */
export interface CapturedRequirementsEventData {
  readonly requirementDocumentId: string;
  readonly workspaceId: string;
  readonly suggestedProjectName: string;
  readonly ideaText: string;
}

export interface CreateProjectFromCapturedRequirementsDependencies {
  readonly projects: Repository<Project, string>;
}

/**
 * Invoked by a real `EventBusPort` subscriber wired at the composition root
 * (the same pattern `tools/sprint0-demo` already proved for
 * `workspace.created.v1`), never called directly by
 * `context-requirements`'s application layer.
 */
export async function createProjectFromCapturedRequirements(
  ctx: RequestContext,
  deps: CreateProjectFromCapturedRequirementsDependencies,
  eventData: CapturedRequirementsEventData,
  generateId: () => string,
): Promise<Project> {
  const project = createProject({
    id: generateId(),
    workspaceId: eventData.workspaceId,
    name: eventData.suggestedProjectName,
    description: eventData.ideaText,
    sourceRequirementDocumentId: eventData.requirementDocumentId,
  });
  await deps.projects.save(ctx, project);
  return project;
}

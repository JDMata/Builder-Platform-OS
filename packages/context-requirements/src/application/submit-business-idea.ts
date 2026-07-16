import type { PolicyEnginePort, Repository, RequestContext } from "@sap-app-factory/ports";
import {
  createRequirementDocument,
  type RequirementDocument,
} from "../domain/requirement-document.js";

/**
 * First real use case this context exposes (VS-1). Checks authorization via
 * the real `PolicyEnginePort` (OPA) adapter, never inferring it from
 * `RequestContext` alone — authentication is not authorization (Sprint 1
 * VS-1 Readiness Review). `actorPermissions` is supplied by the caller
 * (the API route) rather than resolved here, since no real Role/Permission
 * lookup exists yet — Sprint 0's own accepted gap ("Role/Permission
 * schema... empty seed data only, no UI"), not a new one introduced here;
 * extending `RequestContext` itself to carry permissions would be a real
 * architectural change to a foundational, widely-used shape and is
 * deliberately not done without an ADR.
 */
export interface SubmitBusinessIdeaInput {
  readonly workspaceId: string;
  readonly ideaText: string;
  readonly actorPermissions: readonly string[];
  readonly generateId: () => string;
}

export interface SubmitBusinessIdeaDependencies {
  readonly policyEngine: PolicyEnginePort;
  readonly requirementDocuments: Repository<RequirementDocument, string>;
}

export async function submitBusinessIdea(
  ctx: RequestContext,
  deps: SubmitBusinessIdeaDependencies,
  input: SubmitBusinessIdeaInput,
): Promise<RequirementDocument> {
  const decision = await deps.policyEngine.evaluate(ctx, {
    resource: "requirement",
    action: "submit",
    attributes: { permissions: input.actorPermissions },
  });
  if (!decision.allowed) {
    throw new Error(`Not authorized to submit a business idea: ${decision.reason ?? "denied"}`);
  }

  const document = createRequirementDocument({
    id: input.generateId(),
    workspaceId: input.workspaceId,
    ideaText: input.ideaText,
  });
  await deps.requirementDocuments.save(ctx, document);
  return document;
}

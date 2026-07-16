import type {
  DomainEventEnvelope,
  EventBusPort,
  PolicyEnginePort,
  Repository,
  RequestContext,
} from "@sap-app-factory/ports";
import {
  approveRequirementDocument as approveDocument,
  type RequirementDocument,
} from "../domain/requirement-document.js";
import type { Clarification } from "../domain/clarification.js";

/**
 * Confirmation gating + approval + event emission — deliberately does NOT
 * create the `Project` itself. `context-requirements`'s application layer
 * may not import `context-project`'s domain (the
 * `application-no-cross-context` dependency-cruiser rule — cross-context
 * communication is event-only, ADR-0007). `requirements.document.captured.v1`
 * carries everything `context-project`'s own
 * `createProjectFromCapturedRequirements` needs to create the `Project`, via
 * a real subscriber wired at the composition root — the same pattern
 * `tools/sprint0-demo` already proved for `workspace.created.v1`.
 */
export interface RequirementsDocumentCapturedEventData {
  readonly requirementDocumentId: string;
  readonly workspaceId: string;
  readonly suggestedProjectName: string;
  readonly ideaText: string;
}

/** Narrow interface this use case actually needs — avoids depending on the concrete, adapter-tier `ClarificationRepository` class directly. */
export interface ClarificationLookup {
  findByRequirementDocumentId(
    ctx: RequestContext,
    requirementDocumentId: string,
  ): Promise<readonly Clarification[]>;
}

export interface ApproveRequirementDocumentInput {
  readonly requirementDocumentId: string;
  readonly actorPermissions: readonly string[];
  /** For the emitted event's id — application code may not import `events-core`'s `createEnvelope` directly (adapter-tier), so the envelope is built by hand here. */
  readonly generateEventId: () => string;
}

export interface ApproveRequirementDocumentDependencies {
  readonly policyEngine: PolicyEnginePort;
  readonly requirementDocuments: Repository<RequirementDocument, string>;
  readonly clarifications: ClarificationLookup;
  readonly eventBus: EventBusPort;
}

export async function approveRequirementDocument(
  ctx: RequestContext,
  deps: ApproveRequirementDocumentDependencies,
  input: ApproveRequirementDocumentInput,
): Promise<RequirementDocument> {
  const decision = await deps.policyEngine.evaluate(ctx, {
    resource: "requirement",
    action: "approve",
    attributes: { permissions: input.actorPermissions },
  });
  if (!decision.allowed) {
    throw new Error(
      `Not authorized to approve this requirement document: ${decision.reason ?? "denied"}`,
    );
  }

  const document = await deps.requirementDocuments.findById(ctx, input.requirementDocumentId);
  if (!document) {
    throw new Error(`RequirementDocument "${input.requirementDocumentId}" not found`);
  }

  const allClarifications = await deps.clarifications.findByRequirementDocumentId(ctx, document.id);
  const unanswered = allClarifications.filter((c) => c.status === "unanswered");
  if (unanswered.length > 0) {
    throw new Error(`Cannot approve while ${unanswered.length} clarification(s) remain unanswered`);
  }

  const approved = approveDocument(document);
  await deps.requirementDocuments.save(ctx, approved);

  const envelope: DomainEventEnvelope<RequirementsDocumentCapturedEventData> = {
    id: input.generateEventId(),
    type: "requirements.document.captured.v1",
    source: "context-requirements",
    time: new Date().toISOString(),
    tenantId: ctx.tenantId,
    correlationId: ctx.correlationId,
    dataVersion: 1,
    data: {
      requirementDocumentId: approved.id,
      workspaceId: approved.workspaceId,
      suggestedProjectName: approved.suggestedProjectName,
      ideaText: approved.ideaText,
    },
  };
  await deps.eventBus.publish(ctx, envelope);

  return approved;
}

import type { PolicyEnginePort, Repository, RequestContext } from "@sap-app-factory/ports";
import {
  answerClarification as markClarificationAnswered,
  type Clarification,
} from "../domain/clarification.js";

export interface AnswerClarificationInput {
  readonly clarificationId: string;
  readonly answer: string;
  readonly actorPermissions: readonly string[];
}

export interface AnswerClarificationDependencies {
  readonly policyEngine: PolicyEnginePort;
  readonly clarifications: Repository<Clarification, string>;
}

/**
 * Records a human's answer. Re-triggering the structuring capability is the
 * owning `WorkflowDefinition`'s job (VS-1's workflow loops back to a
 * `capability-request` step after this use case runs), not this use case's
 * — keeping the Capability Model's rule intact: only workflows invoke
 * capabilities, application code never calls an LLM capability directly.
 */
export async function answerClarification(
  ctx: RequestContext,
  deps: AnswerClarificationDependencies,
  input: AnswerClarificationInput,
): Promise<Clarification> {
  const decision = await deps.policyEngine.evaluate(ctx, {
    resource: "requirement",
    action: "clarify",
    attributes: { permissions: input.actorPermissions },
  });
  if (!decision.allowed) {
    throw new Error(`Not authorized to answer this clarification: ${decision.reason ?? "denied"}`);
  }

  const existing = await deps.clarifications.findById(ctx, input.clarificationId);
  if (!existing) {
    throw new Error(`Clarification "${input.clarificationId}" not found`);
  }

  const answered = markClarificationAnswered(existing, input.answer);
  await deps.clarifications.save(ctx, answered);
  return answered;
}

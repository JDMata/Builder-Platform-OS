/**
 * `origin: "ai-suggested"` is Product Design Review Quick Win #5 — the agent
 * may propose a criterion the user didn't state but inferred was implied,
 * always as a reviewable proposal (`status: "proposed"`), never silently
 * added as if the user had confirmed it — the agent's own Escalation rule
 * ("never guess") applies here too. `origin: "extracted"` criteria came
 * directly from the idea text and are confirmed on creation.
 */
export type AcceptanceCriterionOrigin = "extracted" | "ai-suggested";
export type AcceptanceCriterionStatus = "proposed" | "confirmed";

export interface AcceptanceCriterion {
  readonly id: string;
  readonly requirementId: string;
  readonly description: string;
  readonly origin: AcceptanceCriterionOrigin;
  readonly status: AcceptanceCriterionStatus;
}

export function createAcceptanceCriterion(input: {
  readonly id: string;
  readonly requirementId: string;
  readonly description: string;
  readonly origin: AcceptanceCriterionOrigin;
}): AcceptanceCriterion {
  if (input.description.trim().length === 0) {
    throw new Error("Acceptance criterion description must not be empty");
  }
  return {
    id: input.id,
    requirementId: input.requirementId,
    description: input.description,
    origin: input.origin,
    status: input.origin === "ai-suggested" ? "proposed" : "confirmed",
  };
}

export function confirmAcceptanceCriterion(criterion: AcceptanceCriterion): AcceptanceCriterion {
  return { ...criterion, status: "confirmed" };
}

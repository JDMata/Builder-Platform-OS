/**
 * A question the `requirements-analyst` agent raises back to a human rather
 * than guessing (see .ai/agents/requirements-analyst/agent.md's Escalation
 * rules). `sourceFragment` is the idea-text excerpt that triggered the
 * question — shown quoted alongside the question on the Clarification Q&A
 * screen (Product Design Review Quick Win #3), not just a bare question with
 * no visible cause. `relatedRequirementIds` is empty when the ambiguity is
 * about the idea as a whole rather than one already-extracted Requirement.
 */
export type ClarificationStatus = "unanswered" | "answered";

export interface Clarification {
  readonly id: string;
  readonly requirementDocumentId: string;
  readonly question: string;
  readonly sourceFragment: string;
  readonly relatedRequirementIds: readonly string[];
  readonly answer: string | undefined;
  readonly status: ClarificationStatus;
}

export function raiseClarification(input: {
  readonly id: string;
  readonly requirementDocumentId: string;
  readonly question: string;
  readonly sourceFragment: string;
  readonly relatedRequirementIds?: readonly string[];
}): Clarification {
  if (input.question.trim().length === 0) {
    throw new Error("Clarification question must not be empty");
  }
  return {
    id: input.id,
    requirementDocumentId: input.requirementDocumentId,
    question: input.question,
    sourceFragment: input.sourceFragment,
    relatedRequirementIds: input.relatedRequirementIds ?? [],
    answer: undefined,
    status: "unanswered",
  };
}

export function answerClarification(clarification: Clarification, answer: string): Clarification {
  if (clarification.status === "answered") {
    throw new Error("Clarification is already answered");
  }
  if (answer.trim().length === 0) {
    throw new Error("Answer must not be empty");
  }
  return { ...clarification, answer, status: "answered" };
}

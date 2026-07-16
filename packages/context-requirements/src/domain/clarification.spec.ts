import { describe, expect, it } from "vitest";
import { answerClarification, raiseClarification } from "./clarification.js";

describe("Clarification", () => {
  it("is raised unanswered, quoting the triggering idea fragment", () => {
    const clarification = raiseClarification({
      id: "c1",
      requirementDocumentId: "d1",
      question: "What counts as a discrepancy over threshold?",
      sourceFragment: "flag discrepancies over a threshold",
    });
    expect(clarification.status).toBe("unanswered");
    expect(clarification.sourceFragment).toBe("flag discrepancies over a threshold");
    expect(clarification.relatedRequirementIds).toEqual([]);
  });

  it("rejects an empty question", () => {
    expect(() =>
      raiseClarification({
        id: "c1",
        requirementDocumentId: "d1",
        question: " ",
        sourceFragment: "x",
      }),
    ).toThrow(/must not be empty/);
  });

  it("carries related requirement ids when the agent can attribute the ambiguity", () => {
    const clarification = raiseClarification({
      id: "c1",
      requirementDocumentId: "d1",
      question: "x",
      sourceFragment: "y",
      relatedRequirementIds: ["r1", "r2"],
    });
    expect(clarification.relatedRequirementIds).toEqual(["r1", "r2"]);
  });

  it("answering transitions status without mutating the prior version", () => {
    const raised = raiseClarification({
      id: "c1",
      requirementDocumentId: "d1",
      question: "x",
      sourceFragment: "y",
    });
    const answered = answerClarification(raised, "Over 5 units or 2%, whichever is greater");
    expect(answered.status).toBe("answered");
    expect(answered.answer).toBe("Over 5 units or 2%, whichever is greater");
    expect(raised.status).toBe("unanswered");
  });

  it("rejects answering an already-answered clarification", () => {
    const raised = raiseClarification({
      id: "c1",
      requirementDocumentId: "d1",
      question: "x",
      sourceFragment: "y",
    });
    const answered = answerClarification(raised, "an answer");
    expect(() => answerClarification(answered, "a second answer")).toThrow(/already answered/);
  });

  it("rejects an empty answer", () => {
    const raised = raiseClarification({
      id: "c1",
      requirementDocumentId: "d1",
      question: "x",
      sourceFragment: "y",
    });
    expect(() => answerClarification(raised, " ")).toThrow(/must not be empty/);
  });
});

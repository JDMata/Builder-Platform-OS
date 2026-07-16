import { describe, expect, it } from "vitest";
import { confirmAcceptanceCriterion, createAcceptanceCriterion } from "./acceptance-criterion.js";

describe("AcceptanceCriterion", () => {
  it("extracted criteria are confirmed on creation", () => {
    const criterion = createAcceptanceCriterion({
      id: "ac1",
      requirementId: "r1",
      description: "System compares counted vs. system quantity per SKU.",
      origin: "extracted",
    });
    expect(criterion.status).toBe("confirmed");
  });

  it("AI-suggested criteria start proposed, never silently confirmed", () => {
    const criterion = createAcceptanceCriterion({
      id: "ac1",
      requirementId: "r1",
      description: "Discrepancies are logged with a timestamp.",
      origin: "ai-suggested",
    });
    expect(criterion.status).toBe("proposed");
  });

  it("rejects an empty description", () => {
    expect(() =>
      createAcceptanceCriterion({
        id: "ac1",
        requirementId: "r1",
        description: " ",
        origin: "extracted",
      }),
    ).toThrow(/must not be empty/);
  });

  it("confirming a proposed criterion transitions status without mutating the prior version", () => {
    const proposed = createAcceptanceCriterion({
      id: "ac1",
      requirementId: "r1",
      description: "x",
      origin: "ai-suggested",
    });
    const confirmed = confirmAcceptanceCriterion(proposed);
    expect(confirmed.status).toBe("confirmed");
    expect(proposed.status).toBe("proposed");
  });
});

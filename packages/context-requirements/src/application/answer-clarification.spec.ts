import { describe, expect, it } from "vitest";
import type { PolicyEnginePort, Repository } from "@sap-app-factory/ports";
import { createTestRequestContext } from "@sap-app-factory/testing-kit";
import { raiseClarification, type Clarification } from "../domain/clarification.js";
import { answerClarification } from "./answer-clarification.js";

function fakePolicyEngine(allowed: boolean): PolicyEnginePort {
  return { evaluate: () => Promise.resolve({ allowed }) };
}

function fakeRepository(seed: Clarification[]): Repository<Clarification, string> {
  const store = new Map(seed.map((c) => [c.id, c]));
  return {
    findById: (_ctx, id) => Promise.resolve(store.get(id)),
    save: (_ctx, clarification) => {
      store.set(clarification.id, clarification);
      return Promise.resolve();
    },
  };
}

describe("answerClarification", () => {
  const ctx = createTestRequestContext();
  const raised = raiseClarification({
    id: "c1",
    requirementDocumentId: "doc-1",
    question: "What counts as a discrepancy over threshold?",
    sourceFragment: "flag discrepancies over a threshold",
  });

  it("records the answer and persists it when authorized", async () => {
    const clarifications = fakeRepository([raised]);
    const answered = await answerClarification(
      ctx,
      { policyEngine: fakePolicyEngine(true), clarifications },
      {
        clarificationId: "c1",
        answer: "Over 5 units or 2%",
        actorPermissions: ["requirement:clarify"],
      },
    );

    expect(answered.status).toBe("answered");
    expect(answered.answer).toBe("Over 5 units or 2%");
    await expect(clarifications.findById(ctx, "c1")).resolves.toMatchObject({ status: "answered" });
  });

  it("rejects when the policy engine denies the action", async () => {
    const clarifications = fakeRepository([raised]);
    await expect(
      answerClarification(
        ctx,
        { policyEngine: fakePolicyEngine(false), clarifications },
        { clarificationId: "c1", answer: "x", actorPermissions: [] },
      ),
    ).rejects.toThrow(/Not authorized/);
  });

  it("throws when the clarification does not exist", async () => {
    const clarifications = fakeRepository([]);
    await expect(
      answerClarification(
        ctx,
        { policyEngine: fakePolicyEngine(true), clarifications },
        { clarificationId: "missing", answer: "x", actorPermissions: ["requirement:clarify"] },
      ),
    ).rejects.toThrow(/not found/);
  });
});

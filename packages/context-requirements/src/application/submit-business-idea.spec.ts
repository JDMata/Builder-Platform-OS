import { describe, expect, it } from "vitest";
import type { PolicyEnginePort, PolicyEvaluationRequest, Repository } from "@sap-app-factory/ports";
import { createTestRequestContext } from "@sap-app-factory/testing-kit";
import type { RequirementDocument } from "../domain/requirement-document.js";
import { submitBusinessIdea } from "./submit-business-idea.js";

function fakePolicyEngine(allowed: boolean): PolicyEnginePort {
  return {
    evaluate(_ctx, _request: PolicyEvaluationRequest) {
      return Promise.resolve({ allowed, reason: allowed ? undefined : "missing permission" });
    },
  };
}

function fakeRepository(): Repository<RequirementDocument, string> & {
  saved: RequirementDocument[];
} {
  const saved: RequirementDocument[] = [];
  return {
    saved,
    findById(_ctx, id) {
      return Promise.resolve(saved.find((d) => d.id === id));
    },
    save(_ctx, document) {
      saved.push(document);
      return Promise.resolve();
    },
  };
}

describe("submitBusinessIdea", () => {
  const ctx = createTestRequestContext();

  it("persists a draft RequirementDocument when authorized", async () => {
    const requirementDocuments = fakeRepository();
    const document = await submitBusinessIdea(
      ctx,
      { policyEngine: fakePolicyEngine(true), requirementDocuments },
      {
        workspaceId: "workspace-1",
        ideaText: "We need a way to reconcile stock counts",
        actorPermissions: ["requirement:submit"],
        generateId: () => "doc-1",
      },
    );

    expect(document.status).toBe("draft");
    expect(requirementDocuments.saved).toHaveLength(1);
    expect(requirementDocuments.saved[0]?.id).toBe("doc-1");
  });

  it("rejects when the policy engine denies the action", async () => {
    const requirementDocuments = fakeRepository();
    await expect(
      submitBusinessIdea(
        ctx,
        { policyEngine: fakePolicyEngine(false), requirementDocuments },
        {
          workspaceId: "workspace-1",
          ideaText: "x",
          actorPermissions: [],
          generateId: () => "doc-1",
        },
      ),
    ).rejects.toThrow(/Not authorized/);
    expect(requirementDocuments.saved).toHaveLength(0);
  });

  it("rejects empty idea text even when authorized (domain invariant still enforced)", async () => {
    const requirementDocuments = fakeRepository();
    await expect(
      submitBusinessIdea(
        ctx,
        { policyEngine: fakePolicyEngine(true), requirementDocuments },
        {
          workspaceId: "workspace-1",
          ideaText: "   ",
          actorPermissions: ["requirement:submit"],
          generateId: () => "doc-1",
        },
      ),
    ).rejects.toThrow(/must not be empty/);
  });
});

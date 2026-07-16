import { describe, expect, it } from "vitest";
import type {
  DomainEventEnvelope,
  EventBusPort,
  PolicyEnginePort,
  Repository,
} from "@sap-app-factory/ports";
import { createTestRequestContext } from "@sap-app-factory/testing-kit";
import {
  raiseClarification,
  answerClarification,
  type Clarification,
} from "../domain/clarification.js";
import {
  createRequirementDocument,
  suggestProjectName,
  type RequirementDocument,
} from "../domain/requirement-document.js";
import {
  approveRequirementDocument,
  type ClarificationLookup,
  type RequirementsDocumentCapturedEventData,
} from "./approve-requirement-document.js";

function fakePolicyEngine(allowed: boolean): PolicyEnginePort {
  return { evaluate: () => Promise.resolve({ allowed }) };
}

function fakeDocumentRepository(
  seed: RequirementDocument,
): Repository<RequirementDocument, string> {
  const store = new Map([[seed.id, seed]]);
  return {
    findById: (_ctx, id) => Promise.resolve(store.get(id)),
    save: (_ctx, document) => {
      store.set(document.id, document);
      return Promise.resolve();
    },
  };
}

function fakeClarificationLookup(clarifications: readonly Clarification[]): ClarificationLookup {
  return {
    findByRequirementDocumentId: () => Promise.resolve(clarifications),
  };
}

function fakeEventBus(): EventBusPort & { published: DomainEventEnvelope[] } {
  const published: DomainEventEnvelope[] = [];
  return {
    published,
    publish: (_ctx, event) => {
      published.push(event);
      return Promise.resolve();
    },
    subscribe: () => {
      // no-op
    },
  };
}

describe("approveRequirementDocument", () => {
  const ctx = createTestRequestContext();

  function buildDocument(): RequirementDocument {
    const draft = createRequirementDocument({
      id: "doc-1",
      workspaceId: "workspace-1",
      ideaText: "We need a way to reconcile stock counts",
    });
    return suggestProjectName(draft, "Shift-End Stock Reconciliation");
  }

  it("approves, persists, and emits requirements.document.captured.v1 when no clarifications are unanswered", async () => {
    const document = buildDocument();
    const requirementDocuments = fakeDocumentRepository(document);
    const eventBus = fakeEventBus();

    const approved = await approveRequirementDocument(
      ctx,
      {
        policyEngine: fakePolicyEngine(true),
        requirementDocuments,
        clarifications: fakeClarificationLookup([]),
        eventBus,
      },
      {
        requirementDocumentId: "doc-1",
        actorPermissions: ["requirement:approve"],
        generateEventId: () => "evt-1",
      },
    );

    expect(approved.status).toBe("approved");
    expect(eventBus.published).toHaveLength(1);
    const event = eventBus.published[0]!;
    expect(event.type).toBe("requirements.document.captured.v1");
    const data = event.data as RequirementsDocumentCapturedEventData;
    expect(data.suggestedProjectName).toBe("Shift-End Stock Reconciliation");
    expect(data.requirementDocumentId).toBe("doc-1");
  });

  it("rejects approval while any clarification remains unanswered", async () => {
    const document = buildDocument();
    const requirementDocuments = fakeDocumentRepository(document);
    const unanswered = raiseClarification({
      id: "c1",
      requirementDocumentId: "doc-1",
      question: "x",
      sourceFragment: "y",
    });
    const eventBus = fakeEventBus();

    await expect(
      approveRequirementDocument(
        ctx,
        {
          policyEngine: fakePolicyEngine(true),
          requirementDocuments,
          clarifications: fakeClarificationLookup([unanswered]),
          eventBus,
        },
        {
          requirementDocumentId: "doc-1",
          actorPermissions: ["requirement:approve"],
          generateEventId: () => "evt-1",
        },
      ),
    ).rejects.toThrow(/unanswered/);
    expect(eventBus.published).toHaveLength(0);
  });

  it("allows approval when all clarifications have been answered", async () => {
    const document = buildDocument();
    const requirementDocuments = fakeDocumentRepository(document);
    const answered = answerClarification(
      raiseClarification({
        id: "c1",
        requirementDocumentId: "doc-1",
        question: "x",
        sourceFragment: "y",
      }),
      "an answer",
    );
    const eventBus = fakeEventBus();

    const approved = await approveRequirementDocument(
      ctx,
      {
        policyEngine: fakePolicyEngine(true),
        requirementDocuments,
        clarifications: fakeClarificationLookup([answered]),
        eventBus,
      },
      {
        requirementDocumentId: "doc-1",
        actorPermissions: ["requirement:approve"],
        generateEventId: () => "evt-1",
      },
    );
    expect(approved.status).toBe("approved");
  });

  it("rejects when the policy engine denies the action", async () => {
    const document = buildDocument();
    await expect(
      approveRequirementDocument(
        ctx,
        {
          policyEngine: fakePolicyEngine(false),
          requirementDocuments: fakeDocumentRepository(document),
          clarifications: fakeClarificationLookup([]),
          eventBus: fakeEventBus(),
        },
        { requirementDocumentId: "doc-1", actorPermissions: [], generateEventId: () => "evt-1" },
      ),
    ).rejects.toThrow(/Not authorized/);
  });

  it("throws when the document does not exist", async () => {
    const document = buildDocument();
    await expect(
      approveRequirementDocument(
        ctx,
        {
          policyEngine: fakePolicyEngine(true),
          requirementDocuments: fakeDocumentRepository(document),
          clarifications: fakeClarificationLookup([]),
          eventBus: fakeEventBus(),
        },
        {
          requirementDocumentId: "missing",
          actorPermissions: ["requirement:approve"],
          generateEventId: () => "evt-1",
        },
      ),
    ).rejects.toThrow(/not found/);
  });
});

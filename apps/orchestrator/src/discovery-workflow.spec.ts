import { describe, expect, it } from "vitest";
import type { Repository } from "@sap-app-factory/ports";
import { createTestRequestContext } from "@sap-app-factory/testing-kit";
import type { RequirementDocument } from "@sap-app-factory/context-requirements";
import { createProject, type Project } from "@sap-app-factory/context-project";
import {
  answerDiscoveryClarification,
  confirmDiscoveryWorkflow,
  deterministicProjectId,
  startDiscoveryWorkflow,
  type DiscoveryWorkflowDependencies,
} from "./discovery-workflow.js";
import {
  FakeCapabilityResolver,
  FakeEventBus,
  FakePolicyEngine,
  FakeWorkflowEngine,
  fakeAcceptanceCriterionRepository,
  fakeClarificationRepository,
  fakeLlmProvider,
  fakeRepository,
  fakeRequirementRepository,
} from "./test-fake-dependencies.js";

function buildDeps(
  overrides: {
    llmResponses?: () => string;
    capabilityProviderId?: string;
  } = {},
): DiscoveryWorkflowDependencies & {
  workflowEngine: FakeWorkflowEngine;
  requirementDocuments: Repository<RequirementDocument, string> & {
    store: Map<string, RequirementDocument>;
  };
  requirements: ReturnType<typeof fakeRequirementRepository>;
  clarifications: ReturnType<typeof fakeClarificationRepository>;
  acceptanceCriteria: ReturnType<typeof fakeAcceptanceCriterionRepository>;
  projects: Repository<Project, string> & { store: Map<string, Project> };
  eventBus: FakeEventBus;
} {
  const oneRequirementNoClarifications = () =>
    JSON.stringify({
      suggestedProjectName: "Shift-End Stock Reconciliation",
      requirements: [
        {
          kind: "functional",
          description: "Reconcile physical stock counts against SAP inventory at shift end.",
          acceptanceCriteria: [{ description: "Discrepancies are logged.", origin: "extracted" }],
        },
      ],
      clarifications: [],
    });

  return {
    workflowEngine: new FakeWorkflowEngine(),
    capabilityResolver: new FakeCapabilityResolver(overrides.capabilityProviderId),
    llmProvider: fakeLlmProvider(overrides.llmResponses ?? oneRequirementNoClarifications),
    policyEngine: new FakePolicyEngine(true),
    eventBus: new FakeEventBus(),
    requirementDocuments: fakeRepository<RequirementDocument>(),
    requirements: fakeRequirementRepository(),
    clarifications: fakeClarificationRepository(),
    acceptanceCriteria: fakeAcceptanceCriterionRepository(),
    projects: fakeRepository<Project>(),
  };
}

describe("startDiscoveryWorkflow", () => {
  const ctx = createTestRequestContext();

  it("captures the idea, structures it, and returns requirements when the model raises no clarifications", async () => {
    const deps = buildDeps();

    const state = await startDiscoveryWorkflow(ctx, deps, {
      workspaceId: "workspace-1",
      ideaText: "We need a way to reconcile stock counts at shift end.",
      actorPermissions: ["requirement:submit"],
    });

    expect(state.document.status).toBe("draft");
    expect(state.document.suggestedProjectName).toBe("Shift-End Stock Reconciliation");
    expect(state.requirements).toHaveLength(1);
    expect(state.unansweredClarifications).toHaveLength(0);
    expect(deps.requirementDocuments.store.size).toBe(1);
    expect(deps.requirements.store.size).toBe(1);
    expect(deps.acceptanceCriteria.store.size).toBe(1);

    const advanceStepIds = deps.workflowEngine.advanced.map((s) => s.stepId);
    expect(advanceStepIds).toEqual([
      "capture-idea",
      "structure-requirement-round-1",
      "approval:confirmation",
    ]);
  });

  it("returns unanswered clarifications when the model raises them, without persisting requirements yet", async () => {
    const deps = buildDeps({
      llmResponses: () =>
        JSON.stringify({
          suggestedProjectName: "x",
          requirements: [],
          clarifications: [
            { question: "What counts as a discrepancy?", sourceFragment: "discrepancies" },
          ],
        }),
    });

    const state = await startDiscoveryWorkflow(ctx, deps, {
      workspaceId: "workspace-1",
      ideaText: "We need a way to reconcile stock counts.",
      actorPermissions: ["requirement:submit"],
    });

    expect(state.unansweredClarifications).toHaveLength(1);
    expect(deps.clarifications.store.size).toBe(1);
    const advanceStepIds = deps.workflowEngine.advanced.map((s) => s.stepId);
    expect(advanceStepIds).toEqual([
      "capture-idea",
      "structure-requirement-round-1",
      "approval:clarification",
    ]);
  });

  it("throws when the capability resolver returns an unexpected provider", async () => {
    const deps = buildDeps({ capabilityProviderId: "some-other-agent" });

    await expect(
      startDiscoveryWorkflow(ctx, deps, {
        workspaceId: "workspace-1",
        ideaText: "We need a way to reconcile stock counts.",
        actorPermissions: ["requirement:submit"],
      }),
    ).rejects.toThrow(/Unexpected capability provider/);
  });
});

describe("answerDiscoveryClarification", () => {
  const ctx = createTestRequestContext();

  it("re-runs structuring once every clarification in the round is answered", async () => {
    let call = 0;
    const deps = buildDeps({
      llmResponses: () => {
        call += 1;
        return call === 1
          ? JSON.stringify({
              suggestedProjectName: "x",
              requirements: [],
              clarifications: [
                { question: "What counts as a discrepancy?", sourceFragment: "discrepancies" },
              ],
            })
          : JSON.stringify({
              suggestedProjectName: "x",
              requirements: [
                {
                  kind: "functional",
                  description: "Reconcile discrepancies.",
                  acceptanceCriteria: [],
                },
              ],
              clarifications: [],
            });
      },
    });
    const started = await startDiscoveryWorkflow(ctx, deps, {
      workspaceId: "workspace-1",
      ideaText: "We need a way to reconcile stock counts.",
      actorPermissions: ["requirement:submit"],
    });
    const clarificationId = started.unansweredClarifications[0]!.id;

    const nextState = await answerDiscoveryClarification(ctx, deps, {
      runId: started.runId,
      requirementDocumentId: started.document.id,
      clarificationId,
      answer: "Over 5 units or 2%, whichever is greater",
      actorPermissions: ["requirement:clarify"],
      round: 1,
    });

    expect(deps.clarifications.store.get(clarificationId)?.status).toBe("answered");
    expect(deps.workflowEngine.signals).toEqual([{ kind: "approved" }]);
    expect(nextState.unansweredClarifications).toHaveLength(0);
  });

  it("returns without re-structuring while other clarifications in the round remain unanswered", async () => {
    const deps = buildDeps({
      llmResponses: () =>
        JSON.stringify({
          suggestedProjectName: "x",
          requirements: [],
          clarifications: [
            { question: "Q1", sourceFragment: "f1" },
            { question: "Q2", sourceFragment: "f2" },
          ],
        }),
    });
    const started = await startDiscoveryWorkflow(ctx, deps, {
      workspaceId: "workspace-1",
      ideaText: "We need a way to reconcile stock counts.",
      actorPermissions: ["requirement:submit"],
    });
    const [first] = started.unansweredClarifications;

    const nextState = await answerDiscoveryClarification(ctx, deps, {
      runId: started.runId,
      requirementDocumentId: started.document.id,
      clarificationId: first!.id,
      answer: "an answer",
      actorPermissions: ["requirement:clarify"],
      round: 1,
    });

    expect(nextState.unansweredClarifications).toHaveLength(1);
    expect(deps.workflowEngine.signals).toHaveLength(0);
  });

  it("cancels the run and throws once the bounded clarification-round limit is exceeded", async () => {
    const deps = buildDeps({
      llmResponses: () =>
        JSON.stringify({
          suggestedProjectName: "x",
          requirements: [],
          clarifications: [{ question: "Still unclear", sourceFragment: "f" }],
        }),
    });
    const started = await startDiscoveryWorkflow(ctx, deps, {
      workspaceId: "workspace-1",
      ideaText: "We need a way to reconcile stock counts.",
      actorPermissions: ["requirement:submit"],
    });

    let state = started;
    for (let round = 1; round <= 4; round += 1) {
      const clarificationId = state.unansweredClarifications[0]!.id;
      state = await answerDiscoveryClarification(ctx, deps, {
        runId: started.runId,
        requirementDocumentId: state.document.id,
        clarificationId,
        answer: `answer round ${round}`,
        actorPermissions: ["requirement:clarify"],
        round,
      });
    }

    const lastClarificationId = state.unansweredClarifications[0]!.id;
    await expect(
      answerDiscoveryClarification(ctx, deps, {
        runId: started.runId,
        requirementDocumentId: state.document.id,
        clarificationId: lastClarificationId,
        answer: "answer round 5",
        actorPermissions: ["requirement:clarify"],
        round: 5,
      }),
    ).rejects.toThrow(/needs manual review/);
    expect(deps.workflowEngine.cancelled).toHaveLength(1);
  });
});

describe("confirmDiscoveryWorkflow", () => {
  const ctx = createTestRequestContext();

  it("approves the document, signals the workflow, and returns the Project once the event handler has created it", async () => {
    const deps = buildDeps();
    const started = await startDiscoveryWorkflow(ctx, deps, {
      workspaceId: "workspace-1",
      ideaText: "We need a way to reconcile stock counts.",
      actorPermissions: ["requirement:submit"],
    });

    // Simulates the composition root's event subscriber (createProjectFromCapturedRequirements)
    // creating the Project asynchronously, out of band from this call.
    const project = createProject({
      id: deterministicProjectId(started.document.id),
      workspaceId: "workspace-1",
      name: started.document.suggestedProjectName,
      description: started.document.ideaText,
      sourceRequirementDocumentId: started.document.id,
    });
    deps.projects.store.set(project.id, project);

    const result = await confirmDiscoveryWorkflow(ctx, deps, {
      runId: started.runId,
      requirementDocumentId: started.document.id,
      actorPermissions: ["requirement:approve"],
    });

    expect(result.id).toBe(project.id);
    expect(deps.eventBus.published).toHaveLength(1);
    expect(deps.eventBus.published[0]?.type).toBe("requirements.document.captured.v1");
    expect(deps.workflowEngine.signals).toEqual([{ kind: "approved" }]);
  });

  it("throws if the Project is never created within the poll window", async () => {
    const deps = buildDeps();
    const started = await startDiscoveryWorkflow(ctx, deps, {
      workspaceId: "workspace-1",
      ideaText: "We need a way to reconcile stock counts.",
      actorPermissions: ["requirement:submit"],
    });

    await expect(
      confirmDiscoveryWorkflow(ctx, deps, {
        runId: started.runId,
        requirementDocumentId: started.document.id,
        actorPermissions: ["requirement:approve"],
      }),
    ).rejects.toThrow(/was not created in time/);
  }, 5000);
});

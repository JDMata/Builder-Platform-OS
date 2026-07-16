import { randomUUID } from "node:crypto";
import {
  approveRequirementDocument,
  submitBusinessIdea,
  answerClarification as answerClarificationUseCase,
  structureBusinessRequirement,
  suggestProjectName,
  type AcceptanceCriterion,
  type Clarification,
  type Requirement,
  type RequirementDocument,
} from "@sap-app-factory/context-requirements";
import type { Project } from "@sap-app-factory/context-project";
import type {
  CapabilityResolverPort,
  EventBusPort,
  LlmProviderPort,
  PolicyEnginePort,
  Repository,
  RequestContext,
  WorkflowEnginePort,
  WorkflowRunId,
} from "@sap-app-factory/ports";

/**
 * The Discovery `WorkflowDefinition` (VS-1) — composition-root orchestration,
 * not inside any single context's application layer, because it legitimately
 * spans two bounded contexts (Requirements Intake, Project & Workspace) and
 * `application-no-cross-context` forbids that inside a context package. This
 * is exactly what a composition-root app is for (04-service-boundaries.md).
 *
 * Bounded to a configurable number of clarification rounds (Sprint 1 VS-1
 * Risk Register #7/#13) — a pathological or adversarial idea cannot loop
 * forever; past the bound, the run is explicitly cancelled with a clear
 * reason rather than left spinning.
 */
const MAX_CLARIFICATION_ROUNDS = 5;

export interface DiscoveryWorkflowDependencies {
  readonly workflowEngine: WorkflowEnginePort;
  readonly capabilityResolver: CapabilityResolverPort;
  readonly llmProvider: LlmProviderPort;
  readonly policyEngine: PolicyEnginePort;
  readonly eventBus: EventBusPort;
  readonly requirementDocuments: Repository<RequirementDocument, string>;
  readonly requirements: Repository<Requirement, string>;
  readonly clarifications: Repository<Clarification, string> & {
    findByRequirementDocumentId(
      ctx: RequestContext,
      requirementDocumentId: string,
    ): Promise<readonly Clarification[]>;
  };
  readonly acceptanceCriteria: Repository<AcceptanceCriterion, string>;
  readonly projects: Repository<Project, string>;
}

export interface DiscoverySessionState {
  readonly runId: WorkflowRunId;
  readonly document: RequirementDocument;
  readonly requirements: readonly Requirement[];
  readonly acceptanceCriteriaByRequirementId: ReadonlyMap<string, readonly AcceptanceCriterion[]>;
  readonly unansweredClarifications: readonly Clarification[];
}

async function runStructuringPass(
  ctx: RequestContext,
  deps: DiscoveryWorkflowDependencies,
  runId: WorkflowRunId,
  document: RequirementDocument,
  round: number,
): Promise<DiscoverySessionState> {
  if (round > MAX_CLARIFICATION_ROUNDS) {
    await deps.workflowEngine.cancel(
      ctx,
      runId,
      `Exceeded ${MAX_CLARIFICATION_ROUNDS} clarification rounds — needs manual review`,
    );
    throw new Error(
      `Discovery session for document "${document.id}" needs manual review — too many clarification rounds`,
    );
  }

  const resolved = await deps.capabilityResolver.resolve(ctx, "structure-business-requirement");
  if (resolved.providerId !== "requirements-analyst") {
    throw new Error(`Unexpected capability provider resolved: "${resolved.providerId}"`);
  }

  const allClarifications = await deps.clarifications.findByRequirementDocumentId(ctx, document.id);
  const answeredClarifications = allClarifications.filter((c) => c.status === "answered");

  const result = await structureBusinessRequirement(ctx, deps.llmProvider, {
    document,
    answeredClarifications,
    generateId: () => randomUUID(),
  });

  const named = suggestProjectName(document, result.suggestedProjectName);
  await deps.requirementDocuments.save(ctx, named);

  for (const requirement of result.requirements) {
    await deps.requirements.save(ctx, requirement);
    const criteria = result.acceptanceCriteriaByRequirementId.get(requirement.id) ?? [];
    for (const criterion of criteria) {
      await deps.acceptanceCriteria.save(ctx, criterion);
    }
  }
  for (const clarification of result.clarifications) {
    await deps.clarifications.save(ctx, clarification);
  }

  await deps.workflowEngine.advance(ctx, runId, {
    stepId: `structure-requirement-round-${round}`,
    succeeded: true,
    output: { requirementCount: result.requirements.length },
  });

  const stillUnanswered = result.clarifications;
  await deps.workflowEngine.advance(ctx, runId, {
    stepId: stillUnanswered.length > 0 ? "approval:clarification" : "approval:confirmation",
    succeeded: true,
    output: { unansweredCount: stillUnanswered.length },
  });

  return {
    runId,
    document: named,
    requirements: result.requirements,
    acceptanceCriteriaByRequirementId: result.acceptanceCriteriaByRequirementId,
    unansweredClarifications: stillUnanswered,
  };
}

export interface StartDiscoveryInput {
  readonly workspaceId: string;
  readonly ideaText: string;
  readonly actorPermissions: readonly string[];
}

/** Task 1.16, part 1: Login -> Start New Project step of the Discovery Workshop. */
export async function startDiscoveryWorkflow(
  ctx: RequestContext,
  deps: DiscoveryWorkflowDependencies,
  input: StartDiscoveryInput,
): Promise<DiscoverySessionState> {
  const runId = await deps.workflowEngine.startRun(ctx, "discovery-v1", { parameters: {} });

  const document = await submitBusinessIdea(
    ctx,
    { policyEngine: deps.policyEngine, requirementDocuments: deps.requirementDocuments },
    {
      workspaceId: input.workspaceId,
      ideaText: input.ideaText,
      actorPermissions: input.actorPermissions,
      generateId: () => randomUUID(),
    },
  );
  await deps.workflowEngine.advance(ctx, runId, {
    stepId: "capture-idea",
    succeeded: true,
    output: { requirementDocumentId: document.id },
  });

  return runStructuringPass(ctx, deps, runId, document, 1);
}

export interface AnswerDiscoveryClarificationInput {
  readonly runId: WorkflowRunId;
  readonly requirementDocumentId: string;
  readonly clarificationId: string;
  readonly answer: string;
  readonly actorPermissions: readonly string[];
  readonly round: number;
}

/** Task 1.16, part 2: the clarification loop. */
export async function answerDiscoveryClarification(
  ctx: RequestContext,
  deps: DiscoveryWorkflowDependencies,
  input: AnswerDiscoveryClarificationInput,
): Promise<DiscoverySessionState> {
  await answerClarificationUseCase(
    ctx,
    { policyEngine: deps.policyEngine, clarifications: deps.clarifications },
    {
      clarificationId: input.clarificationId,
      answer: input.answer,
      actorPermissions: input.actorPermissions,
    },
  );

  const allClarifications = await deps.clarifications.findByRequirementDocumentId(
    ctx,
    input.requirementDocumentId,
  );
  const stillUnanswered = allClarifications.filter((c) => c.status === "unanswered");

  if (stillUnanswered.length > 0) {
    const document = await deps.requirementDocuments.findById(ctx, input.requirementDocumentId);
    if (!document) {
      throw new Error(`RequirementDocument "${input.requirementDocumentId}" not found`);
    }
    return {
      runId: input.runId,
      document,
      requirements: [],
      acceptanceCriteriaByRequirementId: new Map(),
      unansweredClarifications: stillUnanswered,
    };
  }

  await deps.workflowEngine.signal(ctx, input.runId, { kind: "approved" });

  const document = await deps.requirementDocuments.findById(ctx, input.requirementDocumentId);
  if (!document) {
    throw new Error(`RequirementDocument "${input.requirementDocumentId}" not found`);
  }
  return runStructuringPass(ctx, deps, input.runId, document, input.round + 1);
}

export interface ConfirmDiscoveryInput {
  readonly runId: WorkflowRunId;
  readonly requirementDocumentId: string;
  readonly actorPermissions: readonly string[];
}

/** Task 1.16, part 3: User Confirmation -> Project Creation. */
export async function confirmDiscoveryWorkflow(
  ctx: RequestContext,
  deps: DiscoveryWorkflowDependencies,
  input: ConfirmDiscoveryInput,
): Promise<Project> {
  const approvedDocument = await approveRequirementDocument(
    ctx,
    {
      policyEngine: deps.policyEngine,
      requirementDocuments: deps.requirementDocuments,
      clarifications: deps.clarifications,
      eventBus: deps.eventBus,
    },
    {
      requirementDocumentId: input.requirementDocumentId,
      actorPermissions: input.actorPermissions,
      generateEventId: () => randomUUID(),
    },
  );

  await deps.workflowEngine.signal(ctx, input.runId, { kind: "approved" });

  // The real Project is created by context-project's own event-driven
  // handler (createProjectFromCapturedRequirements), subscribed at the
  // composition root — never called directly from here (cross-context
  // communication is event-only). This function looks the created Project
  // back up by its deterministic relationship to the approved document,
  // giving the caller (an HTTP route) something to return immediately
  // rather than a fire-and-forget 202.
  const project = await waitForProjectCreation(ctx, deps, approvedDocument.id);
  return project;
}

/**
 * The transactional outbox delivers `requirements.document.captured.v1`
 * at-least-once, not synchronously with `publish()` returning — a real
 * subscriber (wired at the composition root) creates the `Project`
 * asynchronously. This polls the (in-process) projects repository briefly
 * for it, rather than the caller inventing its own event-correlation
 * mechanism; acceptable at Sprint 1's scale (one in-memory/local-Postgres
 * outbox relay, sub-second in practice), revisited if a later sprint's
 * scale requires a real request/response correlation pattern instead.
 */
async function waitForProjectCreation(
  ctx: RequestContext,
  deps: DiscoveryWorkflowDependencies,
  requirementDocumentId: string,
  attempts = 20,
  delayMs = 100,
): Promise<Project> {
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const projectId = deterministicProjectId(requirementDocumentId);
    const project = await deps.projects.findById(ctx, projectId);
    if (project) {
      return project;
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  throw new Error(
    `Project for RequirementDocument "${requirementDocumentId}" was not created in time`,
  );
}

/** A stable, derivable id — lets this module look up the Project the event handler creates without a shared in-memory registry. */
export function deterministicProjectId(requirementDocumentId: string): string {
  return `project-for-${requirementDocumentId}`;
}

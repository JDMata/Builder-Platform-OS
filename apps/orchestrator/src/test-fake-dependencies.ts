import type {
  CapabilityResolverPort,
  DomainEventEnvelope,
  DomainEventHandler,
  EventBusPort,
  LlmCompletionRequest,
  LlmCompletionResult,
  LlmProviderPort,
  McpConnectionPort,
  McpToolInvocationResult,
  PolicyEnginePort,
  Repository,
  ResolvedCapabilityProvider,
  StepResult,
  WorkflowEnginePort,
  WorkflowRunId,
  WorkflowRunStatus,
  WorkflowSignal,
} from "@sap-app-factory/ports";
import type {
  AcceptanceCriterion,
  Clarification,
  Requirement,
  RequirementDocument,
} from "@sap-app-factory/context-requirements";
import type { Project } from "@sap-app-factory/context-project";
import { registerAgentCapabilities } from "./plugin-loader.js";
import type { OrchestratorDependencies } from "./build-dependencies.js";

/**
 * Test-only fakes — never exported from a public index, never used by
 * `main.ts`. Lets `server.spec.ts`/`discovery-workflow.spec.ts` exercise the
 * Discovery workflow and its HTTP routes without a live Postgres/OPA/Anthropic
 * stack, the same split established in `api-gateway`'s
 * `test-fake-dependencies.ts`.
 */

export class FakePolicyEngine implements PolicyEnginePort {
  constructor(private readonly allowed = true) {}
  evaluate(): Promise<{ allowed: boolean; reason?: string }> {
    return Promise.resolve({ allowed: this.allowed });
  }
}

export class FakeCapabilityResolver implements CapabilityResolverPort {
  constructor(private readonly providerId = "requirements-analyst") {}
  resolve(): Promise<ResolvedCapabilityProvider> {
    return Promise.resolve({
      providerType: "agent",
      providerId: this.providerId,
      providerVersion: 1,
    });
  }
}

export class FakeEventBus implements EventBusPort {
  readonly published: DomainEventEnvelope[] = [];
  publish(_ctx: unknown, event: DomainEventEnvelope): Promise<void> {
    this.published.push(event);
    return Promise.resolve();
  }
  subscribe(_eventType: string, _handler: DomainEventHandler): void {
    // no-op
  }
}

export class FakeWorkflowEngine implements WorkflowEnginePort {
  readonly advanced: StepResult[] = [];
  readonly signals: WorkflowSignal[] = [];
  readonly cancelled: string[] = [];
  startRun(): Promise<WorkflowRunId> {
    return Promise.resolve("run-1");
  }
  advance(
    _ctx: unknown,
    _runId: WorkflowRunId,
    stepResult: StepResult,
  ): Promise<WorkflowRunStatus> {
    this.advanced.push(stepResult);
    return Promise.resolve("running");
  }
  signal(_ctx: unknown, _runId: WorkflowRunId, signal: WorkflowSignal): Promise<void> {
    this.signals.push(signal);
    return Promise.resolve();
  }
  getStatus(): Promise<WorkflowRunStatus> {
    return Promise.resolve("running");
  }
  cancel(_ctx: unknown, _runId: WorkflowRunId, reason: string): Promise<void> {
    this.cancelled.push(reason);
    return Promise.resolve();
  }
}

export class FakeMcpConnection implements McpConnectionPort {
  listTools() {
    return Promise.resolve([]);
  }
  invokeTool(): Promise<McpToolInvocationResult> {
    return Promise.resolve({ content: null, isError: false });
  }
}

/** No network — proves route/orchestration wiring, not the LLM call itself (covered in context-requirements). */
export function fakeLlmProvider(responseContent: () => string): LlmProviderPort {
  return {
    complete(_ctx, _request: LlmCompletionRequest): Promise<LlmCompletionResult> {
      return Promise.resolve({
        content: responseContent(),
        toolCalls: [],
        usage: { inputTokens: 10, outputTokens: 10, costUsd: 0 },
        resolvedProvider: "fake",
        resolvedModel: "fake-model",
      });
    },
    completeStream: async function* () {
      yield { delta: "", done: true };
    },
    embed() {
      return Promise.resolve({
        embeddings: [],
        usage: { inputTokens: 0, outputTokens: 0, costUsd: 0 },
      });
    },
  };
}

export function fakeRepository<T extends { id: string }>(): Repository<T, string> & {
  store: Map<string, T>;
} {
  const store = new Map<string, T>();
  return {
    store,
    findById: (_ctx, id) => Promise.resolve(store.get(id)),
    save: (_ctx, item) => {
      store.set(item.id, item);
      return Promise.resolve();
    },
  };
}

export function fakeClarificationRepository(): Repository<Clarification, string> & {
  store: Map<string, Clarification>;
  findByRequirementDocumentId(
    ctx: unknown,
    requirementDocumentId: string,
  ): Promise<readonly Clarification[]>;
} {
  const store = new Map<string, Clarification>();
  return {
    store,
    findById: (_ctx, id) => Promise.resolve(store.get(id)),
    save: (_ctx, item) => {
      store.set(item.id, item);
      return Promise.resolve();
    },
    findByRequirementDocumentId: (_ctx, requirementDocumentId) =>
      Promise.resolve(
        Array.from(store.values()).filter((c) => c.requirementDocumentId === requirementDocumentId),
      ),
  };
}

export function fakeRequirementRepository(): Repository<Requirement, string> & {
  store: Map<string, Requirement>;
  findByRequirementDocumentId(
    ctx: unknown,
    requirementDocumentId: string,
  ): Promise<readonly Requirement[]>;
} {
  const store = new Map<string, Requirement>();
  return {
    store,
    findById: (_ctx, id) => Promise.resolve(store.get(id)),
    save: (_ctx, item) => {
      store.set(item.id, item);
      return Promise.resolve();
    },
    findByRequirementDocumentId: (_ctx, requirementDocumentId) =>
      Promise.resolve(
        Array.from(store.values()).filter((r) => r.requirementDocumentId === requirementDocumentId),
      ),
  };
}

export function fakeAcceptanceCriterionRepository(): Repository<AcceptanceCriterion, string> & {
  store: Map<string, AcceptanceCriterion>;
  findByRequirementId(ctx: unknown, requirementId: string): Promise<readonly AcceptanceCriterion[]>;
} {
  const store = new Map<string, AcceptanceCriterion>();
  return {
    store,
    findById: (_ctx, id) => Promise.resolve(store.get(id)),
    save: (_ctx, item) => {
      store.set(item.id, item);
      return Promise.resolve();
    },
    findByRequirementId: (_ctx, requirementId) =>
      Promise.resolve(Array.from(store.values()).filter((a) => a.requirementId === requirementId)),
  };
}

/**
 * `plugins`/`capabilityProviders` default to no first-party plugin loaded —
 * the Discovery workflow only ever resolves the `requirements-analyst`
 * agent capability (registered here), never a plugin. Tests asserting on the
 * `fiori-generator` plugin (e.g. `/health`) pass it in via `overrides`
 * instead, since constructing it here would trip the banned-SAP-keyword
 * fitness guard on this non-`.spec.ts` file.
 */
export function buildFakeDependencies(
  overrides: Partial<OrchestratorDependencies> = {},
): OrchestratorDependencies {
  return {
    llmProvider: fakeLlmProvider(() =>
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
      }),
    ),
    mcpConnection: new FakeMcpConnection(),
    eventBus: new FakeEventBus(),
    workflowEngine: new FakeWorkflowEngine(),
    policyEngine: new FakePolicyEngine(),
    capabilityResolver: new FakeCapabilityResolver(),
    plugins: [],
    capabilityProviders: registerAgentCapabilities(),
    requirementDocuments: fakeRepository<RequirementDocument>(),
    requirements: fakeRequirementRepository(),
    clarifications: fakeClarificationRepository(),
    acceptanceCriteria: fakeAcceptanceCriterionRepository(),
    projects: fakeRepository<Project>(),
    ...overrides,
  };
}

import { InMemoryCapabilityResolverAdapter } from "@sap-app-factory/adapter-capability-resolver-in-memory";
import { AnthropicLlmAdapter } from "@sap-app-factory/adapter-llm-anthropic";
import { StdioMcpAdapter } from "@sap-app-factory/adapter-mcp-stdio";
import { InMemoryWorkflowEngineAdapter } from "@sap-app-factory/adapter-workflow-engine-in-memory";
import { OpaPolicyEngineAdapter } from "@sap-app-factory/auth-core";
import { withResilience } from "@sap-app-factory/llm-core";
import { withMcpResilience } from "@sap-app-factory/mcp-core";
import type {
  AcceptanceCriterion,
  Clarification,
  Requirement,
  RequirementDocument,
} from "@sap-app-factory/context-requirements";
import type { Project } from "@sap-app-factory/context-project";
import { FioriGeneratorPlugin } from "@sap-app-factory/plugin-fiori-generator";
import type { CapabilityPlugin } from "@sap-app-factory/plugin-sdk";
import type {
  CapabilityResolverPort,
  EventBusPort,
  LlmProviderPort,
  McpConnectionPort,
  PolicyEnginePort,
  Repository,
  RequestContext,
  WorkflowEnginePort,
} from "@sap-app-factory/ports";
import {
  AcceptanceCriterionRepository,
  ClarificationRepository,
  RequirementDocumentRepository,
  RequirementRepository,
} from "@sap-app-factory/persistence-postgres-requirements";
import { ProjectRepository } from "@sap-app-factory/persistence-postgres-project";
import type { Pool } from "pg";
import {
  registerAgentCapabilities,
  registerPluginCapabilities,
  type CapabilityProviderRegistration,
} from "./plugin-loader.js";

export interface OrchestratorDependencies {
  readonly llmProvider: LlmProviderPort;
  readonly mcpConnection: McpConnectionPort;
  readonly eventBus: EventBusPort;
  readonly workflowEngine: WorkflowEnginePort;
  readonly policyEngine: PolicyEnginePort;
  readonly capabilityResolver: CapabilityResolverPort;
  readonly plugins: readonly CapabilityPlugin[];
  readonly capabilityProviders: readonly CapabilityProviderRegistration[];
  readonly requirementDocuments: Repository<RequirementDocument, string>;
  readonly requirements: Repository<Requirement, string> & {
    findByRequirementDocumentId(
      ctx: RequestContext,
      requirementDocumentId: string,
    ): Promise<readonly Requirement[]>;
  };
  readonly clarifications: Repository<Clarification, string> & {
    findByRequirementDocumentId(
      ctx: RequestContext,
      requirementDocumentId: string,
    ): Promise<readonly Clarification[]>;
  };
  readonly acceptanceCriteria: Repository<AcceptanceCriterion, string> & {
    findByRequirementId(
      ctx: RequestContext,
      requirementId: string,
    ): Promise<readonly AcceptanceCriterion[]>;
  };
  readonly projects: Repository<Project, string>;
}

/**
 * The composition root's dependency graph (CODING_STANDARDS.md § Dependency
 * Injection): every port implementation constructed explicitly here, never
 * behind a service locator. `eventBus` (Postgres), `anthropicApiKey`
 * (`SecretsVaultPort`), and `appPool` (the `saf_app`-role Postgres pool for
 * VS-1's new repositories) are the three dependencies that need a real
 * external resource to construct for real, so they're what this function
 * takes as parameters rather than building itself — `main.ts` is the only
 * place that touches `process.env` or opens a real connection.
 */
export function buildDependencies(
  eventBus: EventBusPort,
  anthropicApiKey: string,
  appPool: Pool,
): OrchestratorDependencies {
  const llmProvider = withResilience(new AnthropicLlmAdapter(anthropicApiKey));
  const mcpConnection = withMcpResilience(new StdioMcpAdapter());
  const workflowEngine = new InMemoryWorkflowEngineAdapter(eventBus, { stepsPerRun: 20 });
  const policyEngine = new OpaPolicyEngineAdapter(
    process.env.SAF_OPA_URL ?? "http://localhost:8181",
  );
  const plugins: readonly CapabilityPlugin[] = [new FioriGeneratorPlugin()];
  const capabilityProviders = [
    ...registerPluginCapabilities(plugins),
    ...registerAgentCapabilities(),
  ];
  const capabilityResolver = new InMemoryCapabilityResolverAdapter(
    capabilityProviders.map((registration) => registration.provider),
  );

  const requirementDocuments = new RequirementDocumentRepository(appPool);
  const requirements = new RequirementRepository(appPool);
  const clarifications = new ClarificationRepository(appPool);
  const acceptanceCriteria = new AcceptanceCriterionRepository(appPool);
  const projects = new ProjectRepository(appPool);

  return {
    llmProvider,
    mcpConnection,
    eventBus,
    workflowEngine,
    policyEngine,
    capabilityResolver,
    plugins,
    capabilityProviders,
    requirementDocuments,
    requirements,
    clarifications,
    acceptanceCriteria,
    projects,
  };
}

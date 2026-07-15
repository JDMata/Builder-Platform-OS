import { AnthropicLlmAdapter } from "@sap-app-factory/adapter-llm-anthropic";
import { StdioMcpAdapter } from "@sap-app-factory/adapter-mcp-stdio";
import { InMemoryWorkflowEngineAdapter } from "@sap-app-factory/adapter-workflow-engine-in-memory";
import { withResilience } from "@sap-app-factory/llm-core";
import { withMcpResilience } from "@sap-app-factory/mcp-core";
import { FioriGeneratorPlugin } from "@sap-app-factory/plugin-fiori-generator";
import type { CapabilityPlugin } from "@sap-app-factory/plugin-sdk";
import type {
  EventBusPort,
  LlmProviderPort,
  McpConnectionPort,
  WorkflowEnginePort,
} from "@sap-app-factory/ports";
import {
  registerPluginCapabilities,
  type CapabilityProviderRegistration,
} from "./plugin-loader.js";

export interface OrchestratorDependencies {
  readonly llmProvider: LlmProviderPort;
  readonly mcpConnection: McpConnectionPort;
  readonly eventBus: EventBusPort;
  readonly workflowEngine: WorkflowEnginePort;
  readonly plugins: readonly CapabilityPlugin[];
  readonly capabilityProviders: readonly CapabilityProviderRegistration[];
}

/**
 * The composition root's dependency graph (CODING_STANDARDS.md § Dependency
 * Injection): every port implementation constructed explicitly here, never
 * behind a service locator. `eventBus` is the one dependency that needs a
 * real external resource (Postgres) to construct for real, so it's the one
 * thing this function takes as a parameter rather than building itself —
 * `main.ts` is the only place that touches `process.env` or opens a real
 * connection; this function (and therefore everything it wires) is testable
 * with any `EventBusPort`, fake or real.
 */
export function buildDependencies(eventBus: EventBusPort): OrchestratorDependencies {
  const llmProvider = withResilience(new AnthropicLlmAdapter());
  const mcpConnection = withMcpResilience(new StdioMcpAdapter());
  const workflowEngine = new InMemoryWorkflowEngineAdapter(eventBus);
  const plugins: readonly CapabilityPlugin[] = [new FioriGeneratorPlugin()];
  const capabilityProviders = registerPluginCapabilities(plugins);

  return { llmProvider, mcpConnection, eventBus, workflowEngine, plugins, capabilityProviders };
}

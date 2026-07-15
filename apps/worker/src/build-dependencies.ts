import { FioriGeneratorPlugin } from "@sap-app-factory/plugin-fiori-generator";
import type { CapabilityPlugin } from "@sap-app-factory/plugin-sdk";
import type { EventBusPort } from "@sap-app-factory/ports";

export interface WorkerDependencies {
  readonly eventBus: EventBusPort;
  readonly plugins: readonly CapabilityPlugin[];
}

/**
 * `worker`'s composition root — smaller than `orchestrator`'s (no LLM/MCP
 * ports, no workflow engine: this app's job is executing plugin invocations,
 * not orchestrating a workflow run). Takes `eventBus` as a parameter for the
 * same reason `orchestrator`'s `buildDependencies` does: it's the one
 * dependency needing a real external resource to construct, so this
 * function stays testable with any `EventBusPort`, fake or real.
 */
export function buildDependencies(eventBus: EventBusPort): WorkerDependencies {
  const plugins: readonly CapabilityPlugin[] = [new FioriGeneratorPlugin()];
  return { eventBus, plugins };
}

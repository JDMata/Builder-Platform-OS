import { describe, expect, it } from "vitest";
import type {
  CapabilityPlugin,
  GeneratedArtifact,
  GenerationInput,
  PluginActivationContext,
  PluginManifest,
  ValidationResult,
} from "@sap-app-factory/plugin-sdk";
import type {
  DomainEventEnvelope,
  DomainEventHandler,
  EventBusPort,
  RequestContext,
} from "@sap-app-factory/ports";
import { invokePlugin } from "./invoke-plugin.js";

class RecordingEventBus implements EventBusPort {
  readonly published: DomainEventEnvelope[] = [];

  publish(_ctx: RequestContext, event: DomainEventEnvelope): Promise<void> {
    this.published.push(event);
    return Promise.resolve();
  }
  subscribe(_eventType: string, _handler: DomainEventHandler): void {
    // no-op
  }
}

const ctx: RequestContext = {
  tenantId: "t1",
  actorId: "u1",
  correlationId: "c1",
  tenancyTier: "pooled",
};

const input: GenerationInput = {
  requirementRefs: [],
  targetEnvironmentRef: "test-env",
  targetExecutionProfile: "local-poc",
  parameters: {},
};

function stubPlugin(overrides: Partial<CapabilityPlugin> = {}): CapabilityPlugin {
  const manifest: PluginManifest = {
    id: "stub-plugin",
    version: 1,
    displayName: "Stub",
    producesArtifactTypes: ["stub-artifact"],
    requiredMcpCapabilities: [],
    requiredLlmCapabilities: [],
    requiredPermissions: [],
    supportedExecutionProfiles: ["local-poc"],
    portCategoriesUsed: [],
  };
  return {
    manifest,
    activate: (_ctx: PluginActivationContext) => Promise.resolve(),
    validate: (_input: GenerationInput): ValidationResult => ({ valid: true, errors: [] }),
    generate: (_input: GenerationInput): Promise<readonly GeneratedArtifact[]> =>
      Promise.resolve([]),
    deactivate: () => Promise.resolve(),
    ...overrides,
  };
}

describe("invokePlugin", () => {
  it("publishes started then completed for a successful invocation", async () => {
    const eventBus = new RecordingEventBus();
    const plugin = stubPlugin();

    const artifacts = await invokePlugin(eventBus, plugin, ctx, input);

    expect(artifacts).toEqual([]);
    expect(eventBus.published.map((e) => e.type)).toEqual([
      "generation.job.started.v1",
      "generation.job.completed.v1",
    ]);
  });

  it("publishes started then failed, and rethrows, when the plugin throws", async () => {
    const eventBus = new RecordingEventBus();
    const plugin = stubPlugin({
      generate: () => Promise.reject(new Error("generation blew up")),
    });

    await expect(invokePlugin(eventBus, plugin, ctx, input)).rejects.toThrow("generation blew up");
    expect(eventBus.published.map((e) => e.type)).toEqual([
      "generation.job.started.v1",
      "generation.job.failed.v1",
    ]);
  });

  it("includes the plugin id and artifact count on the completed event", async () => {
    const eventBus = new RecordingEventBus();
    const artifact: GeneratedArtifact = {
      artifactType: "stub-artifact",
      content: {},
      generatedForExecutionProfile: "local-poc",
    };
    const plugin = stubPlugin({ generate: () => Promise.resolve([artifact]) });

    await invokePlugin(eventBus, plugin, ctx, input);

    const completed = eventBus.published.find((e) => e.type === "generation.job.completed.v1");
    expect(completed?.data).toMatchObject({ pluginId: "stub-plugin", artifactCount: 1 });
  });

  it("stringifies a non-Error thrown value as the failure reason", async () => {
    const eventBus = new RecordingEventBus();
    // Deliberately rejecting with a non-Error value — this test exists
    // specifically to exercise invokePlugin's `error instanceof Error`
    // fallback branch.
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    const plugin = stubPlugin({ generate: () => Promise.reject("just a string") });

    await expect(invokePlugin(eventBus, plugin, ctx, input)).rejects.toBe("just a string");

    const failed = eventBus.published.find((e) => e.type === "generation.job.failed.v1");
    expect(failed?.data).toMatchObject({ reason: "just a string" });
  });

  it("every published event shares the same jobId across started/completed", async () => {
    const eventBus = new RecordingEventBus();
    const plugin = stubPlugin();

    await invokePlugin(eventBus, plugin, ctx, input);

    const [started, completed] = eventBus.published as [DomainEventEnvelope, DomainEventEnvelope];
    expect((started.data as { jobId: string }).jobId).toBe(
      (completed.data as { jobId: string }).jobId,
    );
  });
});

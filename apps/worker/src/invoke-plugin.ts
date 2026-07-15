import { randomUUID } from "node:crypto";
import { createEnvelope } from "@sap-app-factory/events-core";
import { execute } from "@sap-app-factory/plugin-sdk";
import type {
  CapabilityPlugin,
  GeneratedArtifact,
  GenerationInput,
} from "@sap-app-factory/plugin-sdk";
import type { EventBusPort, RequestContext } from "@sap-app-factory/ports";

/**
 * `worker`'s job-execution path (04-service-boundaries.md: "Executes queued
 * steps: plugin invocations, generation jobs"). Sprint 0 invokes in-process,
 * directly, via `plugin-sdk`'s `execute()` seam — no real queue yet, see
 * this app's README for why. Every invocation emits
 * `generation.job.started.v1` / `.completed.v1` / `.failed.v1` regardless of
 * what the plugin does internally (05-plugin-architecture.md: "observability
 * and audit are structural, not opt-in per plugin") — structural here means
 * this function, not something each plugin has to remember to do itself.
 */
export async function invokePlugin(
  eventBus: EventBusPort,
  plugin: CapabilityPlugin,
  ctx: RequestContext,
  input: GenerationInput,
): Promise<readonly GeneratedArtifact[]> {
  const jobId = randomUUID();

  await eventBus.publish(
    ctx,
    createEnvelope(ctx, {
      type: "generation.job.started.v1",
      source: "worker",
      dataVersion: 1,
      data: { jobId, pluginId: plugin.manifest.id },
    }),
  );

  try {
    const artifacts = await execute(plugin, ctx, input);
    await eventBus.publish(
      ctx,
      createEnvelope(ctx, {
        type: "generation.job.completed.v1",
        source: "worker",
        dataVersion: 1,
        data: { jobId, pluginId: plugin.manifest.id, artifactCount: artifacts.length },
      }),
    );
    return artifacts;
  } catch (error) {
    await eventBus.publish(
      ctx,
      createEnvelope(ctx, {
        type: "generation.job.failed.v1",
        source: "worker",
        dataVersion: 1,
        data: {
          jobId,
          pluginId: plugin.manifest.id,
          reason: error instanceof Error ? error.message : String(error),
        },
      }),
    );
    throw error;
  }
}

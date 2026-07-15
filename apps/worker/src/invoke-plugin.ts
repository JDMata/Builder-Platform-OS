import { randomUUID } from "node:crypto";
import { createEnvelope } from "@sap-app-factory/events-core";
import {
  correlationFromRequestContext,
  createLogger,
  getTracer,
  withSpan,
} from "@sap-app-factory/observability";
import { execute } from "@sap-app-factory/plugin-sdk";
import type {
  CapabilityPlugin,
  GeneratedArtifact,
  GenerationInput,
} from "@sap-app-factory/plugin-sdk";
import type { EventBusPort, RequestContext } from "@sap-app-factory/ports";

const tracer = getTracer("worker");
const logger = createLogger("worker");

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
  // executionId = this generation job's id — the one real "execution id" any
  // Sprint 0 call path actually has (see packages/observability's README
  // § "where appropriate": no real workflowId/projectId exists anywhere yet).
  const correlation = correlationFromRequestContext(ctx, { executionId: jobId });

  return withSpan(tracer, "worker.invoke-plugin", correlation, async () => {
    logger.info("generation job started", correlation, { pluginId: plugin.manifest.id });
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
      logger.info("generation job completed", correlation, {
        pluginId: plugin.manifest.id,
        artifactCount: artifacts.length,
      });
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
      const reason = error instanceof Error ? error.message : String(error);
      logger.error("generation job failed", correlation, { pluginId: plugin.manifest.id, reason });
      await eventBus.publish(
        ctx,
        createEnvelope(ctx, {
          type: "generation.job.failed.v1",
          source: "worker",
          dataVersion: 1,
          data: { jobId, pluginId: plugin.manifest.id, reason },
        }),
      );
      throw error;
    }
  });
}

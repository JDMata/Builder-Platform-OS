import type { RequestContext } from "./request-context.js";

/**
 * See ADR-0008 (in-house adapter first, Temporal-class spike bias per the
 * post-review update) and docs/architecture/07-workflow-engine.md. `orchestrator`
 * depends only on this port — never a concrete engine's SDK or execution model.
 */

export type WorkflowRunId = string;

export interface WorkflowInput {
  readonly requirementRefs?: readonly string[];
  readonly parameters: Record<string, unknown>;
}

export type WorkflowRunStatus =
  "pending" | "running" | "awaiting_approval" | "completed" | "failed" | "cancelled";

export interface StepResult {
  readonly stepId: string;
  readonly output: unknown;
  readonly succeeded: boolean;
  readonly errorMessage?: string;
}

export interface WorkflowSignal {
  readonly kind: "approved" | "rejected";
  readonly reason?: string;
}

export interface WorkflowEnginePort {
  startRun(ctx: RequestContext, definitionId: string, input: WorkflowInput): Promise<WorkflowRunId>;
  advance(
    ctx: RequestContext,
    runId: WorkflowRunId,
    stepResult: StepResult,
  ): Promise<WorkflowRunStatus>;
  signal(ctx: RequestContext, runId: WorkflowRunId, signal: WorkflowSignal): Promise<void>;
  getStatus(ctx: RequestContext, runId: WorkflowRunId): Promise<WorkflowRunStatus>;
  cancel(ctx: RequestContext, runId: WorkflowRunId, reason: string): Promise<void>;
}

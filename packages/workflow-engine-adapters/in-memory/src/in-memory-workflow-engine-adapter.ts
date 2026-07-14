import { createEnvelope } from "@sap-app-factory/events-core";
import type {
  EventBusPort,
  RequestContext,
  StepResult,
  WorkflowEnginePort,
  WorkflowInput,
  WorkflowRunId,
  WorkflowRunStatus,
  WorkflowSignal,
} from "@sap-app-factory/ports";

const TERMINAL_STATUSES: ReadonlySet<WorkflowRunStatus> = new Set([
  "completed",
  "failed",
  "cancelled",
]);

/**
 * A `stepId` prefixed this way is treated as the "human-approval" `Step`
 * kind (docs/architecture/07-workflow-engine.md) rather than counting toward
 * step completion — a documented Sprint 0 convention, since no real `Step`/
 * `WorkflowDefinition` exists yet to declare a step's kind structurally.
 */
const APPROVAL_STEP_PREFIX = "approval:";

export interface InMemoryWorkflowEngineAdapterOptions {
  /**
   * Sprint 0 stand-in for a real `WorkflowDefinition`'s step count — no
   * definition registry exists yet to look this up from, so it's a fixed
   * number per adapter instance. Default 2, matching the contract test's
   * "trivial-two-step" run.
   */
  readonly stepsPerRun?: number;
  /** A step failing more than this many times fails the whole run. Default 3. */
  readonly maxStepRetries?: number;
  /** No timeout enforced by default — `checkTimeouts()` is a no-op until set. */
  readonly runTimeoutMs?: number;
}

interface RunState {
  readonly ctx: RequestContext;
  readonly definitionId: string;
  status: WorkflowRunStatus;
  completedSteps: number;
  readonly stepRetryCounts: Map<string, number>;
  lastActivityAt: number;
}

/**
 * Sprint 0 skeleton per ADR-0008 and docs/architecture/07-workflow-engine.md:
 * proves the `WorkflowEnginePort` state machine, retry/timeout hooks, and
 * event integration hold together — deliberately not backed by Postgres or
 * BullMQ/Redis (the real in-house adapter ADR-0008 describes). Growing this
 * into that real, durable adapter before the SAF-24 Temporal-class spike
 * happens would be exactly the "sunk cost before the evaluation" risk flagged
 * in 17-sprint0-architecture-inventory-review.md — so this stays in-memory
 * and stays a skeleton on purpose, not as an oversight.
 */
export class InMemoryWorkflowEngineAdapter implements WorkflowEnginePort {
  private readonly runs = new Map<WorkflowRunId, RunState>();
  private readonly stepsPerRun: number;
  private readonly maxStepRetries: number;
  private readonly runTimeoutMs: number | undefined;
  private nextRunSeq = 1;

  constructor(
    private readonly eventBus: EventBusPort,
    options: InMemoryWorkflowEngineAdapterOptions = {},
  ) {
    this.stepsPerRun = options.stepsPerRun ?? 2;
    this.maxStepRetries = options.maxStepRetries ?? 3;
    this.runTimeoutMs = options.runTimeoutMs;
  }

  async startRun(
    ctx: RequestContext,
    definitionId: string,
    _input: WorkflowInput,
  ): Promise<WorkflowRunId> {
    const runId = `run-${this.nextRunSeq}`;
    this.nextRunSeq += 1;
    this.runs.set(runId, {
      ctx,
      definitionId,
      status: "running",
      completedSteps: 0,
      stepRetryCounts: new Map(),
      lastActivityAt: Date.now(),
    });
    await this.publish(ctx, "workflow.run.started.v1", { runId, definitionId });
    return runId;
  }

  async advance(
    ctx: RequestContext,
    runId: WorkflowRunId,
    stepResult: StepResult,
  ): Promise<WorkflowRunStatus> {
    const run = this.getRunOrThrow(runId);
    this.assertNotTerminal(run);
    run.lastActivityAt = Date.now();

    if (!stepResult.succeeded) {
      const retries = (run.stepRetryCounts.get(stepResult.stepId) ?? 0) + 1;
      run.stepRetryCounts.set(stepResult.stepId, retries);
      if (retries > this.maxStepRetries) {
        run.status = "failed";
        await this.publish(ctx, "workflow.run.failed.v1", {
          runId,
          stepId: stepResult.stepId,
          reason: stepResult.errorMessage ?? "step exhausted retries",
        });
      }
      return run.status;
    }

    run.stepRetryCounts.delete(stepResult.stepId);
    await this.publish(ctx, "workflow.step.completed.v1", { runId, stepId: stepResult.stepId });

    if (stepResult.stepId.startsWith(APPROVAL_STEP_PREFIX)) {
      run.status = "awaiting_approval";
      return run.status;
    }

    run.completedSteps += 1;
    if (run.completedSteps >= this.stepsPerRun) {
      run.status = "completed";
      await this.publish(ctx, "workflow.run.completed.v1", { runId });
    }
    return run.status;
  }

  async signal(ctx: RequestContext, runId: WorkflowRunId, signal: WorkflowSignal): Promise<void> {
    const run = this.getRunOrThrow(runId);
    if (run.status !== "awaiting_approval") {
      throw new Error(`Cannot signal run ${runId}: not awaiting approval (status=${run.status})`);
    }
    run.lastActivityAt = Date.now();

    if (signal.kind === "rejected") {
      run.status = "cancelled";
      await this.publish(ctx, "workflow.run.cancelled.v1", { runId, reason: signal.reason });
      return;
    }

    run.completedSteps += 1;
    if (run.completedSteps >= this.stepsPerRun) {
      run.status = "completed";
      await this.publish(ctx, "workflow.run.completed.v1", { runId });
    } else {
      run.status = "running";
    }
  }

  getStatus(_ctx: RequestContext, runId: WorkflowRunId): Promise<WorkflowRunStatus> {
    return Promise.resolve(this.getRunOrThrow(runId).status);
  }

  async cancel(ctx: RequestContext, runId: WorkflowRunId, reason: string): Promise<void> {
    const run = this.getRunOrThrow(runId);
    this.assertNotTerminal(run);
    run.status = "cancelled";
    await this.publish(ctx, "workflow.run.cancelled.v1", { runId, reason });
  }

  /**
   * Transitions any non-terminal run whose last activity exceeded
   * `runTimeoutMs` to `failed`. Exposed rather than run on an internal
   * timer so tests can drive it deterministically without waiting on a real
   * clock — the same pattern used by `PostgresOutboxAdapter.claimAndDispatch()`.
   * A no-op if `runTimeoutMs` was never configured.
   */
  async checkTimeouts(now: number = Date.now()): Promise<void> {
    if (this.runTimeoutMs === undefined) {
      return;
    }
    for (const [runId, run] of this.runs) {
      if (TERMINAL_STATUSES.has(run.status)) {
        continue;
      }
      if (now - run.lastActivityAt > this.runTimeoutMs) {
        run.status = "failed";
        await this.publish(run.ctx, "workflow.run.failed.v1", { runId, reason: "timeout" });
      }
    }
  }

  private async publish(
    ctx: RequestContext,
    type: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    await this.eventBus.publish(
      ctx,
      createEnvelope(ctx, { type, source: "workflow-engine", dataVersion: 1, data }),
    );
  }

  private getRunOrThrow(runId: WorkflowRunId): RunState {
    const run = this.runs.get(runId);
    if (!run) {
      throw new Error(`No such workflow run: ${runId}`);
    }
    return run;
  }

  private assertNotTerminal(run: RunState): void {
    if (TERMINAL_STATUSES.has(run.status)) {
      throw new Error(`Run is already in a terminal state: ${run.status}`);
    }
  }
}

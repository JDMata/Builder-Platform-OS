import { describe, expect, it } from "vitest";
import type { DomainEventEnvelope, DomainEventHandler, EventBusPort } from "@sap-app-factory/ports";
import {
  createTestRequestContext,
  workflowEngineContractTests,
} from "@sap-app-factory/testing-kit";
import { InMemoryWorkflowEngineAdapter } from "./in-memory-workflow-engine-adapter.js";

/** A minimal recording EventBusPort test double — real dispatch, nothing mocked out beyond "no transport." */
class RecordingEventBus implements EventBusPort {
  readonly published: DomainEventEnvelope[] = [];
  private readonly handlers = new Map<string, DomainEventHandler[]>();

  publish(_ctx: unknown, event: DomainEventEnvelope): Promise<void> {
    this.published.push(event);
    for (const handler of this.handlers.get(event.type) ?? []) {
      void handler(event);
    }
    return Promise.resolve();
  }

  subscribe(eventType: string, handler: DomainEventHandler): void {
    const existing = this.handlers.get(eventType);
    if (existing) {
      existing.push(handler);
    } else {
      this.handlers.set(eventType, [handler]);
    }
  }
}

// The real proof the contract-test harness works: this is not a fake, it's
// the actual adapter this package ships.
workflowEngineContractTests(() => new InMemoryWorkflowEngineAdapter(new RecordingEventBus()));

describe("InMemoryWorkflowEngineAdapter — event integration", () => {
  it("publishes started, step-completed, and run-completed events for a two-step run", async () => {
    const eventBus = new RecordingEventBus();
    const adapter = new InMemoryWorkflowEngineAdapter(eventBus);
    const ctx = createTestRequestContext();

    const runId = await adapter.startRun(ctx, "trivial-two-step", { parameters: {} });
    await adapter.advance(ctx, runId, { stepId: "step-1", output: {}, succeeded: true });
    await adapter.advance(ctx, runId, { stepId: "step-2", output: {}, succeeded: true });

    expect(eventBus.published.map((e) => e.type)).toEqual([
      "workflow.run.started.v1",
      "workflow.step.completed.v1",
      "workflow.step.completed.v1",
      "workflow.run.completed.v1",
    ]);
  });

  it("publishes run-cancelled on cancel()", async () => {
    const eventBus = new RecordingEventBus();
    const adapter = new InMemoryWorkflowEngineAdapter(eventBus);
    const ctx = createTestRequestContext();

    const runId = await adapter.startRun(ctx, "trivial-two-step", { parameters: {} });
    await adapter.cancel(ctx, runId, "no longer needed");

    expect(eventBus.published.at(-1)?.type).toBe("workflow.run.cancelled.v1");
  });
});

describe("InMemoryWorkflowEngineAdapter — retries", () => {
  it("stays running while a step fails within the retry budget", async () => {
    const adapter = new InMemoryWorkflowEngineAdapter(new RecordingEventBus(), {
      maxStepRetries: 2,
    });
    const ctx = createTestRequestContext();
    const runId = await adapter.startRun(ctx, "trivial-two-step", { parameters: {} });

    const afterFirstFailure = await adapter.advance(ctx, runId, {
      stepId: "step-1",
      output: {},
      succeeded: false,
      errorMessage: "transient",
    });
    const afterSecondFailure = await adapter.advance(ctx, runId, {
      stepId: "step-1",
      output: {},
      succeeded: false,
      errorMessage: "transient",
    });

    expect(afterFirstFailure).toBe("running");
    expect(afterSecondFailure).toBe("running");
  });

  it("fails the run once a step exceeds its retry budget", async () => {
    const eventBus = new RecordingEventBus();
    const adapter = new InMemoryWorkflowEngineAdapter(eventBus, { maxStepRetries: 1 });
    const ctx = createTestRequestContext();
    const runId = await adapter.startRun(ctx, "trivial-two-step", { parameters: {} });

    await adapter.advance(ctx, runId, { stepId: "step-1", output: {}, succeeded: false });
    const status = await adapter.advance(ctx, runId, {
      stepId: "step-1",
      output: {},
      succeeded: false,
    });

    expect(status).toBe("failed");
    expect(eventBus.published.at(-1)?.type).toBe("workflow.run.failed.v1");
  });

  it("resets a step's retry count once it succeeds", async () => {
    const adapter = new InMemoryWorkflowEngineAdapter(new RecordingEventBus(), {
      maxStepRetries: 1,
    });
    const ctx = createTestRequestContext();
    const runId = await adapter.startRun(ctx, "trivial-two-step", { parameters: {} });

    await adapter.advance(ctx, runId, { stepId: "step-1", output: {}, succeeded: false });
    const afterSuccess = await adapter.advance(ctx, runId, {
      stepId: "step-1",
      output: {},
      succeeded: true,
    });

    expect(afterSuccess).toBe("running");
  });
});

describe("InMemoryWorkflowEngineAdapter — human approval via signal()", () => {
  it("moves to awaiting_approval on an approval-kind step, then completes on signal(approved)", async () => {
    const eventBus = new RecordingEventBus();
    const adapter = new InMemoryWorkflowEngineAdapter(eventBus, { stepsPerRun: 1 });
    const ctx = createTestRequestContext();
    const runId = await adapter.startRun(ctx, "trivial-two-step", { parameters: {} });

    const afterApprovalStep = await adapter.advance(ctx, runId, {
      stepId: "approval:review-gate",
      output: {},
      succeeded: true,
    });
    expect(afterApprovalStep).toBe("awaiting_approval");

    await adapter.signal(ctx, runId, { kind: "approved" });
    expect(await adapter.getStatus(ctx, runId)).toBe("completed");
  });

  it("returns to running (not completed) on signal(approved) when more steps remain", async () => {
    const adapter = new InMemoryWorkflowEngineAdapter(new RecordingEventBus(), { stepsPerRun: 2 });
    const ctx = createTestRequestContext();
    const runId = await adapter.startRun(ctx, "trivial-two-step", { parameters: {} });

    await adapter.advance(ctx, runId, {
      stepId: "approval:review-gate",
      output: {},
      succeeded: true,
    });
    await adapter.signal(ctx, runId, { kind: "approved" });

    expect(await adapter.getStatus(ctx, runId)).toBe("running");
  });

  it("cancels the run on signal(rejected)", async () => {
    const adapter = new InMemoryWorkflowEngineAdapter(new RecordingEventBus());
    const ctx = createTestRequestContext();
    const runId = await adapter.startRun(ctx, "trivial-two-step", { parameters: {} });

    await adapter.advance(ctx, runId, {
      stepId: "approval:review-gate",
      output: {},
      succeeded: true,
    });
    await adapter.signal(ctx, runId, { kind: "rejected", reason: "not ready" });

    expect(await adapter.getStatus(ctx, runId)).toBe("cancelled");
  });

  it("rejects signal() when the run isn't awaiting approval", async () => {
    const adapter = new InMemoryWorkflowEngineAdapter(new RecordingEventBus());
    const ctx = createTestRequestContext();
    const runId = await adapter.startRun(ctx, "trivial-two-step", { parameters: {} });

    await expect(adapter.signal(ctx, runId, { kind: "approved" })).rejects.toThrow(
      /not awaiting approval/,
    );
  });
});

describe("InMemoryWorkflowEngineAdapter — timeout hook", () => {
  it("does nothing when no runTimeoutMs is configured", async () => {
    const adapter = new InMemoryWorkflowEngineAdapter(new RecordingEventBus());
    const ctx = createTestRequestContext();
    const runId = await adapter.startRun(ctx, "trivial-two-step", { parameters: {} });

    await adapter.checkTimeouts(Date.now() + 1_000_000_000);

    expect(await adapter.getStatus(ctx, runId)).toBe("running");
  });

  it("fails a run whose last activity exceeded runTimeoutMs", async () => {
    const eventBus = new RecordingEventBus();
    const adapter = new InMemoryWorkflowEngineAdapter(eventBus, { runTimeoutMs: 1_000 });
    const ctx = createTestRequestContext();
    const runId = await adapter.startRun(ctx, "trivial-two-step", { parameters: {} });

    await adapter.checkTimeouts(Date.now() + 5_000);

    expect(await adapter.getStatus(ctx, runId)).toBe("failed");
    expect(eventBus.published.at(-1)?.type).toBe("workflow.run.failed.v1");
  });

  it("leaves a run alone if it's within the timeout window", async () => {
    const adapter = new InMemoryWorkflowEngineAdapter(new RecordingEventBus(), {
      runTimeoutMs: 1_000,
    });
    const ctx = createTestRequestContext();
    const runId = await adapter.startRun(ctx, "trivial-two-step", { parameters: {} });

    await adapter.checkTimeouts(Date.now() + 500);

    expect(await adapter.getStatus(ctx, runId)).toBe("running");
  });

  it("never times out an already-terminal run", async () => {
    const adapter = new InMemoryWorkflowEngineAdapter(new RecordingEventBus(), {
      runTimeoutMs: 1_000,
    });
    const ctx = createTestRequestContext();
    const runId = await adapter.startRun(ctx, "trivial-two-step", { parameters: {} });
    await adapter.cancel(ctx, runId, "done early");

    await adapter.checkTimeouts(Date.now() + 5_000);

    expect(await adapter.getStatus(ctx, runId)).toBe("cancelled");
  });
});

describe("InMemoryWorkflowEngineAdapter — invalid transitions", () => {
  it("throws advancing an unknown run", async () => {
    const adapter = new InMemoryWorkflowEngineAdapter(new RecordingEventBus());
    const ctx = createTestRequestContext();

    await expect(
      adapter.advance(ctx, "no-such-run", { stepId: "step-1", output: {}, succeeded: true }),
    ).rejects.toThrow(/No such workflow run/);
  });

  it("throws advancing a run that's already terminal", async () => {
    const adapter = new InMemoryWorkflowEngineAdapter(new RecordingEventBus());
    const ctx = createTestRequestContext();
    const runId = await adapter.startRun(ctx, "trivial-two-step", { parameters: {} });
    await adapter.cancel(ctx, runId, "done");

    await expect(
      adapter.advance(ctx, runId, { stepId: "step-1", output: {}, succeeded: true }),
    ).rejects.toThrow(/already in a terminal state/);
  });
});

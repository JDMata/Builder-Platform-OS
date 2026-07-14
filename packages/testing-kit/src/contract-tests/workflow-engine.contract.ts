import { describe, expect, it } from "vitest";
import type { WorkflowEnginePort } from "@sap-app-factory/ports";
import { createTestRequestContext } from "../request-context.fixture.js";

/**
 * Any adapter behind WorkflowEnginePort must pass this suite — proves a
 * trivial two-step run round-trips, per docs/architecture/07-workflow-engine.md.
 */
export function workflowEngineContractTests(
  createAdapter: () => WorkflowEnginePort | Promise<WorkflowEnginePort>,
): void {
  describe("WorkflowEnginePort contract", () => {
    it("a started run can be advanced through two steps to completion", async () => {
      const adapter = await createAdapter();
      const ctx = createTestRequestContext();

      const runId = await adapter.startRun(ctx, "trivial-two-step", { parameters: {} });
      expect(await adapter.getStatus(ctx, runId)).not.toBe("failed");

      await adapter.advance(ctx, runId, { stepId: "step-1", output: {}, succeeded: true });
      const statusAfterStepOne = await adapter.advance(ctx, runId, {
        stepId: "step-2",
        output: {},
        succeeded: true,
      });

      expect(statusAfterStepOne).toBe("completed");
    });

    it("cancel() moves a run to cancelled", async () => {
      const adapter = await createAdapter();
      const ctx = createTestRequestContext();

      const runId = await adapter.startRun(ctx, "trivial-two-step", { parameters: {} });
      await adapter.cancel(ctx, runId, "contract test cancellation");

      expect(await adapter.getStatus(ctx, runId)).toBe("cancelled");
    });
  });
}

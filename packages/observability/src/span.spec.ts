import { SpanStatusCode } from "@opentelemetry/api";
import { afterEach, describe, expect, it } from "vitest";
import type { CorrelationFields } from "./correlation.js";
import { withSpan } from "./span.js";
import { createInMemoryTracer } from "./test-support.js";

describe("withSpan", () => {
  let harness: ReturnType<typeof createInMemoryTracer> | undefined;

  afterEach(async () => {
    await harness?.shutdown();
    harness = undefined;
  });

  it("sets the mandatory correlation.id attribute and marks status OK on success", async () => {
    harness = createInMemoryTracer();
    const correlation: CorrelationFields = { correlationId: "corr-1" };

    const result = await withSpan(harness.tracer, "test.op", correlation, async () => "done");

    expect(result).toBe("done");
    const [span] = harness.exporter.getFinishedSpans();
    expect(span?.attributes["correlation.id"]).toBe("corr-1");
    expect(span?.status.code).toBe(SpanStatusCode.OK);
  });

  it("only sets optional attributes that are actually present", async () => {
    harness = createInMemoryTracer();
    const correlation: CorrelationFields = {
      correlationId: "corr-1",
      tenantId: "tenant-1",
      executionId: "job-1",
    };

    await withSpan(harness.tracer, "test.op", correlation, async () => undefined);

    const [span] = harness.exporter.getFinishedSpans();
    expect(span?.attributes["tenant.id"]).toBe("tenant-1");
    expect(span?.attributes["execution.id"]).toBe("job-1");
    expect(span?.attributes["actor.id"]).toBeUndefined();
    expect(span?.attributes["workflow.id"]).toBeUndefined();
    expect(span?.attributes["project.id"]).toBeUndefined();
  });

  it("sets workflowId/projectId/actorId attributes when present", async () => {
    harness = createInMemoryTracer();
    const correlation: CorrelationFields = {
      correlationId: "corr-1",
      actorId: "actor-1",
      workflowId: "run-1",
      projectId: "project-1",
    };

    await withSpan(harness.tracer, "test.op", correlation, async () => undefined);

    const [span] = harness.exporter.getFinishedSpans();
    expect(span?.attributes["actor.id"]).toBe("actor-1");
    expect(span?.attributes["workflow.id"]).toBe("run-1");
    expect(span?.attributes["project.id"]).toBe("project-1");
    expect(span?.attributes["tenant.id"]).toBeUndefined();
    expect(span?.attributes["execution.id"]).toBeUndefined();
  });

  it("records the exception, marks status ERROR, and rethrows on failure", async () => {
    harness = createInMemoryTracer();
    const correlation: CorrelationFields = { correlationId: "corr-1" };

    await expect(
      withSpan(harness.tracer, "test.op", correlation, async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    const [span] = harness.exporter.getFinishedSpans();
    expect(span?.status.code).toBe(SpanStatusCode.ERROR);
    expect(span?.status.message).toBe("boom");
    expect(span?.events.some((event) => event.name === "exception")).toBe(true);
  });
});

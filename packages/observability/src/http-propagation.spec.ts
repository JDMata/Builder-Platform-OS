import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { injectTraceContext, runWithExtractedContext } from "./http-propagation.js";
import { createInMemoryTracer, enableGlobalContextPropagation } from "./test-support.js";

describe("HTTP trace-context propagation", () => {
  beforeAll(() => {
    enableGlobalContextPropagation();
  });

  let harness: ReturnType<typeof createInMemoryTracer> | undefined;

  afterEach(async () => {
    await harness?.shutdown();
    harness = undefined;
  });

  it("round-trips the same trace ID across a simulated process boundary", async () => {
    harness = createInMemoryTracer();

    let injectedHeaders: Record<string, string> = {};
    let originalTraceId = "";

    await harness.tracer.startActiveSpan("client.call", async (span) => {
      originalTraceId = span.spanContext().traceId;
      injectedHeaders = injectTraceContext({});
      span.end();
    });

    // Real cross-process boundary: `injectedHeaders` is exactly what would
    // travel over HTTP (`web` -> `api-gateway`); the "server" side extracts
    // it and starts a *new* span that must land in the *same* trace.
    expect(injectedHeaders.traceparent).toBeDefined();

    const serverTraceId = runWithExtractedContext(injectedHeaders, () => {
      return harness!.tracer.startActiveSpan("server.handle", (span) => {
        const id = span.spanContext().traceId;
        span.end();
        return id;
      });
    });

    expect(serverTraceId).toBe(originalTraceId);
  });

  it("extracts a traceparent delivered as a repeated (array-valued) header", async () => {
    harness = createInMemoryTracer();
    let originalTraceId = "";
    let injectedTraceparent = "";

    await harness.tracer.startActiveSpan("client.call", async (span) => {
      originalTraceId = span.spanContext().traceId;
      injectedTraceparent = injectTraceContext({}).traceparent ?? "";
      span.end();
    });

    const serverTraceId = runWithExtractedContext({ traceparent: [injectedTraceparent] }, () =>
      harness!.tracer.startActiveSpan("server.handle", (span) => {
        const id = span.spanContext().traceId;
        span.end();
        return id;
      }),
    );

    expect(serverTraceId).toBe(originalTraceId);
  });

  it("ignores an empty array-valued header instead of throwing", () => {
    harness = createInMemoryTracer();

    const traceId = runWithExtractedContext({ traceparent: [] }, () =>
      harness!.tracer.startActiveSpan("no-parent", (span) => {
        const id = span.spanContext().traceId;
        span.end();
        return id;
      }),
    );

    expect(traceId).toMatch(/^[0-9a-f]{32}$/);
  });

  it("starts a fresh, unrelated trace when no headers are extracted", () => {
    harness = createInMemoryTracer();

    const traceId = runWithExtractedContext({}, () =>
      harness!.tracer.startActiveSpan("no-parent", (span) => {
        const id = span.spanContext().traceId;
        span.end();
        return id;
      }),
    );

    expect(traceId).toMatch(/^[0-9a-f]{32}$/);
  });
});

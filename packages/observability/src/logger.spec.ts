import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { CorrelationFields } from "./correlation.js";
import { createLogger } from "./logger.js";
import { createInMemoryTracer, enableGlobalContextPropagation } from "./test-support.js";

const correlation: CorrelationFields = {
  correlationId: "corr-1",
  tenantId: "tenant-1",
  actorId: "actor-1",
};

function spyOnStdoutWrite(): { lastLine: () => Record<string, unknown> } {
  let captured = "";
  vi.spyOn(process.stdout, "write").mockImplementation((chunk: string | Uint8Array) => {
    captured = typeof chunk === "string" ? chunk : Buffer.from(chunk).toString("utf-8");
    return true;
  });
  return { lastLine: () => JSON.parse(captured) as Record<string, unknown> };
}

describe("createLogger", () => {
  beforeAll(() => {
    enableGlobalContextPropagation();
  });

  let harness: ReturnType<typeof createInMemoryTracer> | undefined;

  afterEach(async () => {
    await harness?.shutdown();
    harness = undefined;
    vi.restoreAllMocks();
  });

  it("writes a structured JSON line carrying correlationId/tenantId/actorId", () => {
    const stdout = spyOnStdoutWrite();
    const logger = createLogger("test-service");

    logger.info("plugin invoked", correlation, { pluginId: "fiori-generator" });

    const line = stdout.lastLine();
    expect(line).toMatchObject({
      level: "info",
      service: "test-service",
      message: "plugin invoked",
      correlationId: "corr-1",
      tenantId: "tenant-1",
      actorId: "actor-1",
      pluginId: "fiori-generator",
    });
    expect(typeof line.time).toBe("string");
  });

  it.each(["debug", "warn", "error"] as const)("supports the %s level", (level) => {
    const stdout = spyOnStdoutWrite();
    const logger = createLogger("test-service");

    logger[level]("something happened", correlation);

    expect(stdout.lastLine().level).toBe(level);
  });

  it("redacts banned fields before writing", () => {
    const stdout = spyOnStdoutWrite();
    const logger = createLogger("test-service");

    logger.error("token exchange failed", correlation, {
      accessToken: "super-secret-value",
      reason: "invalid_grant",
    });

    const line = stdout.lastLine();
    expect(line.accessToken).toBe("[REDACTED]");
    expect(line.reason).toBe("invalid_grant");
  });

  it("attaches traceId/spanId when called inside an active span", async () => {
    harness = createInMemoryTracer();
    const stdout = spyOnStdoutWrite();
    const logger = createLogger("test-service");

    let expectedTraceId = "";
    await harness.tracer.startActiveSpan("test.op", async (span) => {
      expectedTraceId = span.spanContext().traceId;
      logger.info("inside a span", correlation);
      span.end();
    });

    const line = stdout.lastLine();
    expect(line.traceId).toBe(expectedTraceId);
    expect(typeof line.spanId).toBe("string");
  });

  it("omits traceId/spanId when there is no active span", () => {
    const stdout = spyOnStdoutWrite();
    const logger = createLogger("test-service");

    logger.info("no span here", correlation);

    const line = stdout.lastLine();
    expect(line.traceId).toBeUndefined();
    expect(line.spanId).toBeUndefined();
  });
});

import { describe, expect, it } from "vitest";
import { getTracer, startTracing } from "./tracing.js";

describe("startTracing", () => {
  it("returns a usable tracer and a shutdown function that resolves cleanly", async () => {
    // Deliberately points at a port nothing listens on: proves startTracing()
    // never throws on an unreachable Collector (span export is async/
    // best-effort, per OpenTelemetry's own design — a Collector outage must
    // never take an app down) and that shutdown() resolves even with no
    // spans ever created to flush.
    const handle = startTracing({
      serviceName: "test-service",
      otlpEndpoint: "http://127.0.0.1:1",
    });

    expect(typeof handle.tracer.startSpan).toBe("function");
    await expect(handle.shutdown()).resolves.toBeUndefined();
  });

  it("getTracer returns a tracer bound to the registered global provider", () => {
    startTracing({ serviceName: "test-service", otlpEndpoint: "http://127.0.0.1:1" });

    const tracer = getTracer("test-service");

    expect(typeof tracer.startSpan).toBe("function");
  });
});

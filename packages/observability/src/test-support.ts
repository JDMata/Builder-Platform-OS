import { context, propagation } from "@opentelemetry/api";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { InMemorySpanExporter, SimpleSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";

/**
 * `withSpan`'s own attribute/status logic doesn't need a registered global
 * context manager (see `createInMemoryTracer` below), but proving real
 * cross-boundary propagation (`http-propagation.spec.ts`) and trace/log
 * correlation (`logger.spec.ts`) does — `context.active()`/`getActiveSpan()`
 * only reflect a started span once something actually threads context
 * through `await`/callback boundaries. Idempotent: OpenTelemetry's global
 * setters silently keep the first-registered instance if called again, so
 * multiple spec files calling this in the same Vitest worker is safe.
 */
export function enableGlobalContextPropagation(): void {
  const manager = new AsyncLocalStorageContextManager();
  manager.enable();
  context.setGlobalContextManager(manager);
  propagation.setGlobalPropagator(new W3CTraceContextPropagator());
}

/**
 * Test-only: a real (not faked) tracer backed by an in-memory exporter, so
 * span attributes/status/exceptions can be asserted directly against real
 * OpenTelemetry SDK objects. Deliberately NOT registered globally
 * (`provider.register()` is never called here) — these tests exercise
 * `withSpan`'s own logic, not global context propagation, and must not leak
 * a global tracer provider registration across other spec files.
 */
export function createInMemoryTracer() {
  const exporter = new InMemorySpanExporter();
  const provider = new NodeTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(exporter)],
  });
  return {
    tracer: provider.getTracer("test"),
    exporter,
    shutdown: () => provider.shutdown(),
  };
}

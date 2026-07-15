import { SpanStatusCode, type Tracer } from "@opentelemetry/api";
import type { CorrelationFields } from "./correlation.js";

/**
 * The one shared instrumentation helper ADR-0012 calls for ("every port
 * invocation... wrapped in a span by convention enforced through shared
 * instrumentation helpers, not left to each call site to remember"). Sets the
 * correlation fields as span attributes, records an exception and marks the
 * span's status on failure, and always ends the span — a call site can't
 * forget `span.end()` because it never calls it directly.
 */
export async function withSpan<T>(
  tracer: Tracer,
  name: string,
  correlation: CorrelationFields,
  fn: () => Promise<T>,
): Promise<T> {
  return tracer.startActiveSpan(name, async (span) => {
    span.setAttribute("correlation.id", correlation.correlationId);
    if (correlation.tenantId !== undefined) span.setAttribute("tenant.id", correlation.tenantId);
    if (correlation.actorId !== undefined) span.setAttribute("actor.id", correlation.actorId);
    if (correlation.workflowId !== undefined)
      span.setAttribute("workflow.id", correlation.workflowId);
    if (correlation.executionId !== undefined)
      span.setAttribute("execution.id", correlation.executionId);
    if (correlation.projectId !== undefined) span.setAttribute("project.id", correlation.projectId);

    try {
      const result = await fn();
      span.setStatus({ code: SpanStatusCode.OK });
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      span.recordException(err);
      span.setStatus({ code: SpanStatusCode.ERROR, message: err.message });
      throw error;
    } finally {
      span.end();
    }
  });
}

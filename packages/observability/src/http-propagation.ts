import { context, propagation } from "@opentelemetry/api";

/**
 * The client side of cross-process trace propagation: injects the active
 * span's W3C `traceparent` (and any baggage) into an outgoing request's
 * headers, so the receiving process's extracted context continues the same
 * trace instead of starting a new one. Used by `web`'s server-side fetch to
 * `api-gateway` — the one real inter-app HTTP call Sprint 0 has.
 */
export function injectTraceContext(headers: Record<string, string> = {}): Record<string, string> {
  propagation.inject(context.active(), headers);
  return headers;
}

/**
 * The server side: extracts an inbound request's trace context from its
 * headers and runs `fn` inside it, so any span `fn` starts becomes a child of
 * the caller's span rather than the start of a new, disconnected trace.
 */
export function runWithExtractedContext<T>(
  headers: Record<string, string | string[] | undefined>,
  fn: () => T,
): T {
  const carrier: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    if (typeof value === "string") {
      carrier[key] = value;
    } else if (Array.isArray(value) && value.length > 0 && value[0] !== undefined) {
      carrier[key] = value[0];
    }
  }
  const extracted = propagation.extract(context.active(), carrier);
  return context.with(extracted, fn);
}

import { retryWithBackoff } from "@sap-app-factory/resilience-kit";
import type { RetryOptions } from "@sap-app-factory/resilience-kit";
import type { LlmProviderPort } from "@sap-app-factory/ports";

/**
 * Wraps any LlmProviderPort adapter with timeout + bounded retry, delegating
 * the generic retry/timeout algorithm to @sap-app-factory/resilience-kit
 * (shared with mcp-core's equivalent wrapper) rather than reimplementing it.
 *
 * This is a real, minimal resilience layer — deliberately NOT the full
 * ADR-0016 mechanism yet. Circuit-breaker state shared across
 * orchestrator/worker replicas via Redis is SAF-27, not built here.
 */
export type ResilienceOptions = RetryOptions;

const DEFAULT_OPTIONS: ResilienceOptions = {
  maxAttempts: 3,
  timeoutMs: 10_000,
  baseBackoffMs: 50,
};

export function withResilience(
  adapter: LlmProviderPort,
  options: Partial<ResilienceOptions> = {},
): LlmProviderPort {
  const resolved: ResilienceOptions = { ...DEFAULT_OPTIONS, ...options };

  return {
    complete: (ctx, request) => retryWithBackoff(() => adapter.complete(ctx, request), resolved),
    // Streaming isn't retried mid-stream — resuming a partially-streamed
    // response is a real feature, not Sprint 0 scope.
    completeStream: (ctx, request) => adapter.completeStream(ctx, request),
    embed: (ctx, request) => retryWithBackoff(() => adapter.embed(ctx, request), resolved),
  };
}

import { retryWithBackoff } from "@sap-app-factory/resilience-kit";
import type { RetryOptions } from "@sap-app-factory/resilience-kit";
import type { McpConnectionPort } from "@sap-app-factory/ports";

/**
 * Wraps any McpConnectionPort adapter with timeout + bounded retry,
 * delegating the generic retry/timeout algorithm to
 * @sap-app-factory/resilience-kit (shared with llm-core's equivalent
 * wrapper) rather than reimplementing it. See ADR-0016.
 *
 * Real, minimal resilience layer — not the full ADR-0016 mechanism yet.
 * Redis-backed cross-replica circuit-breaker state is SAF-27, not built here.
 */
export type McpResilienceOptions = RetryOptions;

const DEFAULT_OPTIONS: McpResilienceOptions = {
  maxAttempts: 3,
  timeoutMs: 10_000,
  baseBackoffMs: 50,
};

export function withMcpResilience(
  adapter: McpConnectionPort,
  options: Partial<McpResilienceOptions> = {},
): McpConnectionPort {
  const resolved: McpResilienceOptions = { ...DEFAULT_OPTIONS, ...options };

  return {
    listTools: (ctx, serverId) =>
      retryWithBackoff(() => adapter.listTools(ctx, serverId), resolved),
    invokeTool: (ctx, request) =>
      retryWithBackoff(() => adapter.invokeTool(ctx, request), resolved),
  };
}

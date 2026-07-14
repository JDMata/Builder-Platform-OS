import { clearTimeout, setTimeout } from "node:timers";
import type { LlmProviderPort } from "@sap-app-factory/ports";

/**
 * Wraps any LlmProviderPort adapter with timeout + bounded retry.
 *
 * This is a real, minimal resilience layer — deliberately NOT the full
 * ADR-0016 mechanism yet. Circuit-breaker state shared across
 * orchestrator/worker replicas via Redis is SAF-27, not built here; this
 * wrapper's retry/timeout state is in-memory and per-call, which is honest
 * for a single-process Sprint 0 but will under-protect once multiple
 * replicas hammer the same failing provider simultaneously — exactly the
 * problem SAF-27 exists to close.
 */
export interface ResilienceOptions {
  readonly maxAttempts: number;
  readonly timeoutMs: number;
  readonly baseBackoffMs: number;
}

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
    complete: (ctx, request) => retryWithTimeout(() => adapter.complete(ctx, request), resolved),
    // Streaming isn't retried mid-stream — resuming a partially-streamed
    // response is a real feature, not Sprint 0 scope.
    completeStream: (ctx, request) => adapter.completeStream(ctx, request),
    embed: (ctx, request) => retryWithTimeout(() => adapter.embed(ctx, request), resolved),
  };
}

async function retryWithTimeout<T>(fn: () => Promise<T>, options: ResilienceOptions): Promise<T> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {
    try {
      return await withTimeout(fn(), options.timeoutMs);
    } catch (error) {
      lastError = error;
      if (attempt < options.maxAttempts) {
        await sleep(2 ** attempt * options.baseBackoffMs);
      }
    }
  }
  throw lastError;
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error instanceof Error ? error : new Error(String(error)));
      },
    );
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

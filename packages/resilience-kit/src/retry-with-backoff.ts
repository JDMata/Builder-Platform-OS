import { setTimeout } from "node:timers";
import { withTimeout } from "./with-timeout.js";

/**
 * Generic, port-agnostic retry + timeout primitive — shared by every port's
 * resilience wrapper (llm-core, mcp-core, ...) rather than each
 * reimplementing the same algorithm. See ADR-0016.
 *
 * This is the in-memory, per-process piece only. Circuit-breaker state shared
 * across orchestrator/worker replicas via Redis is SAF-27, not built here.
 */
export interface RetryOptions {
  readonly maxAttempts: number;
  readonly timeoutMs: number;
  readonly baseBackoffMs: number;
}

export async function retryWithBackoff<T>(fn: () => Promise<T>, options: RetryOptions): Promise<T> {
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

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

import type { RequestContext } from "./request-context.js";

/**
 * Added post-review — per-tenant/provider/plugin quotas
 * (docs/architecture/13-principal-architect-self-review.md §9). Backed by
 * Redis in practice so state is shared across orchestrator/worker replicas,
 * per ADR-0016 — that's an adapter concern, not part of this contract.
 */

export interface RateLimitCheckRequest {
  /** e.g. "tenant:<id>:llm:reasoning-large" — the bucket this check consumes from. */
  readonly bucketKey: string;
  readonly cost: number;
}

export interface RateLimitCheckResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly resetAtEpochMs: number;
}

export interface RateLimiterPort {
  check(ctx: RequestContext, request: RateLimitCheckRequest): Promise<RateLimitCheckResult>;
}

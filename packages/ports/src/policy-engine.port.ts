import type { RequestContext } from "./request-context.js";

/**
 * See ADR-0011 (hybrid RBAC + ABAC via policy-as-code). Authorization logic is
 * data, evaluated here — never scattered role-check conditionals in
 * application code.
 */

export interface PolicyEvaluationRequest {
  readonly resource: string;
  readonly action: string;
  readonly attributes?: Record<string, unknown>;
}

export interface PolicyEvaluationResult {
  readonly allowed: boolean;
  readonly reason?: string;
  readonly policyId?: string;
  readonly policyVersion?: number;
}

export interface PolicyEnginePort {
  evaluate(ctx: RequestContext, request: PolicyEvaluationRequest): Promise<PolicyEvaluationResult>;
}

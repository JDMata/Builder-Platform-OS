import type {
  PolicyEnginePort,
  PolicyEvaluationRequest,
  PolicyEvaluationResult,
  RequestContext,
} from "@sap-app-factory/ports";

const POLICY_PACKAGE = "sap_app_factory/authz";
const POLICY_ID = "sap_app_factory.authz";
const POLICY_VERSION = 1;

interface OpaDataResponse {
  readonly result?: boolean;
}

/**
 * `PolicyEnginePort` implemented against a real OPA server (ADR-0011) — the
 * "start with the simplest adapter that satisfies the port" choice R6 in
 * 12-risks-and-technical-debt.md calls for: OPA already ships a single
 * static binary with an HTTP data API, so this is a real Rego evaluation,
 * not an in-house rule DSL (explicitly rejected in ADR-0011's alternatives).
 * `baseUrl` points at OPA's `/v1/data` API — never anything Keycloak- or
 * Postgres-specific; this adapter has no dependency on either.
 */
export class OpaPolicyEngineAdapter implements PolicyEnginePort {
  constructor(private readonly baseUrl: string) {}

  async evaluate(
    _ctx: RequestContext,
    request: PolicyEvaluationRequest,
  ): Promise<PolicyEvaluationResult> {
    const response = await fetch(`${this.baseUrl}/v1/data/${POLICY_PACKAGE}/allow`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        input: {
          resource: request.resource,
          action: request.action,
          attributes: request.attributes ?? {},
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`OPA evaluation failed: ${response.status} ${response.statusText}`);
    }

    const body = (await response.json()) as OpaDataResponse;
    return {
      allowed: body.result === true,
      policyId: POLICY_ID,
      policyVersion: POLICY_VERSION,
    };
  }
}

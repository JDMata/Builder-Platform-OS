import * as client from "openid-client";
import type {
  PolicyEnginePort,
  PolicyEvaluationResult,
  RequestContext,
} from "@sap-app-factory/ports";
import type { ApiGatewayDependencies } from "./build-dependencies.js";

/**
 * Test-only fakes — never exported from a public index, never used by
 * `main.ts`. Lets server.spec.ts test the routes that don't need a live
 * Keycloak/OPA (`/health`, `/me`, 404 handling) without requiring the infra
 * stack to be up; `auth-routes.spec.ts` covers `/auth/login`/`/auth/callback`
 * against the real services, the same split established in `auth-core`.
 */
class FakePolicyEngine implements PolicyEnginePort {
  evaluate(_ctx: RequestContext): Promise<PolicyEvaluationResult> {
    return Promise.resolve({ allowed: true });
  }
}

export function buildFakeDependencies(
  overrides: Partial<ApiGatewayDependencies> = {},
): ApiGatewayDependencies {
  const oidcConfig = new client.Configuration(
    {
      issuer: "https://idp.test",
      authorization_endpoint: "https://idp.test/protocol/openid-connect/auth",
      token_endpoint: "https://idp.test/protocol/openid-connect/token",
      jwks_uri: "https://idp.test/protocol/openid-connect/certs",
    },
    "test-client-id",
    "test-client-secret",
  );

  return {
    oidcConfig,
    policyEngine: new FakePolicyEngine(),
    validateAccessToken: () => Promise.reject(new Error("not used by these tests")),
    sessionSecret: "test-session-secret",
    orchestratorUrl: "http://127.0.0.1:0",
    webUrl: "http://127.0.0.1:0",
    ...overrides,
  };
}

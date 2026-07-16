import {
  createAccessTokenValidator,
  createOidcClient,
  OpaPolicyEngineAdapter,
  type AccessTokenValidator,
} from "@sap-app-factory/auth-core";
import type { PolicyEnginePort } from "@sap-app-factory/ports";
import type * as client from "openid-client";

export interface ApiGatewayDependencies {
  readonly oidcConfig: client.Configuration;
  readonly policyEngine: PolicyEnginePort;
  readonly validateAccessToken: AccessTokenValidator;
  readonly sessionSecret: string;
  readonly orchestratorUrl: string;
}

/**
 * SAF-17 closes the wiring SAF-4 deferred: real `auth-core` session handling
 * and a real `PolicyEnginePort` (OPA), both against the docker-compose
 * services SAF-13/SAF-17 provisioned. Env vars default to that stack so a
 * bare `pnpm dev` works with zero configuration — override for any other
 * IdP/OPA deployment.
 */
export async function buildDependencies(): Promise<ApiGatewayDependencies> {
  const oidcConfig = await createOidcClient({
    issuerUrl:
      process.env.SAF_KEYCLOAK_ISSUER_URL ?? "http://localhost:8080/realms/sap-app-factory",
    clientId: process.env.SAF_KEYCLOAK_CLIENT_ID ?? "sap-app-factory-api-gateway",
    clientSecret: process.env.SAF_KEYCLOAK_CLIENT_SECRET ?? "dev-only-client-secret",
  });
  const policyEngine = new OpaPolicyEngineAdapter(
    process.env.SAF_OPA_URL ?? "http://localhost:8181",
  );
  const validateAccessToken = createAccessTokenValidator(oidcConfig);
  // Sprint 0 default is intentionally obviously-a-placeholder — never used
  // in any real deployment, where SAF_SESSION_SECRET must be set for real.
  const sessionSecret = process.env.SAF_SESSION_SECRET ?? "dev-only-insecure-session-secret";
  const orchestratorUrl = process.env.SAF_ORCHESTRATOR_URL ?? "http://localhost:3002";

  return { oidcConfig, policyEngine, validateAccessToken, sessionSecret, orchestratorUrl };
}

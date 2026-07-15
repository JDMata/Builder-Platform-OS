import * as client from "openid-client";

/**
 * Test-only support code — never exported from index.ts, never imported by
 * production code, and explicitly excluded from this package's own build
 * (tsconfig.build.json) so the hardcoded dev-only credentials below never
 * ship in `dist/`. Real integration specs in this package are gated behind
 * SAF_TEST_KEYCLOAK_ISSUER_URL, matching the SAF_TEST_POSTGRES_URL
 * convention already used elsewhere (adapter-events-postgres-outbox,
 * persistence-postgres/*).
 */
export const testKeycloakIssuerUrl = process.env.SAF_TEST_KEYCLOAK_ISSUER_URL;
export const testOpaUrl = process.env.SAF_TEST_OPA_URL;

export const TEST_CLIENT_ID = "sap-app-factory-api-gateway";
export const TEST_CLIENT_SECRET = "dev-only-client-secret";
export const TEST_USERNAME = "dev-user";
export const TEST_PASSWORD = "dev-user-password";

/**
 * Fetches a genuinely real, signed token from Keycloak using the Resource
 * Owner Password (direct grant) flow — enabled on the dev realm's client
 * *only* so this test suite can obtain a real token to validate without
 * browser automation. Production code (`beginAuthorizationRequest`/
 * `exchangeAuthorizationCode`) never uses this grant type — Authorization
 * Code + PKCE only, per ADR-0010. Never exported outside this file.
 */
export async function fetchTestAccessToken(config: client.Configuration): Promise<string> {
  const tokens = await client.genericGrantRequest(config, "password", {
    username: TEST_USERNAME,
    password: TEST_PASSWORD,
    scope: "openid",
  });
  return tokens.access_token;
}

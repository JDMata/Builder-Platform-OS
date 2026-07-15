import { describe, expect, it } from "vitest";
import { createOidcClient } from "./oidc-client.js";
import { TEST_CLIENT_ID, TEST_CLIENT_SECRET, testKeycloakIssuerUrl } from "./test-support.js";

/**
 * Real integration test against the docker-compose Keycloak (SAF-13) and
 * its imported sap-app-factory realm/client (SAF-17) — gated behind
 * SAF_TEST_KEYCLOAK_ISSUER_URL. See infra/docker-compose/keycloak-import/
 * for the realm this discovers against.
 */
describe.skipIf(!testKeycloakIssuerUrl)(
  "createOidcClient (requires SAF_TEST_KEYCLOAK_ISSUER_URL)",
  () => {
    it("performs real OIDC discovery against Keycloak and returns usable metadata", async () => {
      const config = await createOidcClient({
        issuerUrl: testKeycloakIssuerUrl!,
        clientId: TEST_CLIENT_ID,
        clientSecret: TEST_CLIENT_SECRET,
      });

      const metadata = config.serverMetadata();
      expect(metadata.issuer).toBe(testKeycloakIssuerUrl);
      expect(metadata.authorization_endpoint).toContain("/protocol/openid-connect/auth");
      expect(metadata.token_endpoint).toContain("/protocol/openid-connect/token");
      expect(metadata.jwks_uri).toContain("/protocol/openid-connect/certs");
    });

    it("rejects an issuer URL for a realm that doesn't exist", async () => {
      // Discovery fetches the issuer's own well-known document and doesn't
      // validate `clientId` at all (client existence is only checked later,
      // during an actual token request) — the genuinely testable discovery-
      // time failure is a bad issuer, not a bad client id.
      await expect(
        createOidcClient({
          issuerUrl: `${new URL(testKeycloakIssuerUrl!).origin}/realms/no-such-realm`,
          clientId: TEST_CLIENT_ID,
          clientSecret: TEST_CLIENT_SECRET,
        }),
      ).rejects.toThrow();
    });
  },
);

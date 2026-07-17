import { describe, expect, it } from "vitest";
import { createOidcClient } from "./oidc-client.js";
import { exchangeAuthorizationCode } from "./exchange-code.js";
import { TEST_CLIENT_ID, TEST_CLIENT_SECRET, testKeycloakIssuerUrl } from "./test-support.js";

/**
 * Getting a real authorization *code* requires an actual browser login —
 * not available in this environment (see this package's README § Sprint 0
 * limitation). What's still genuinely testable against the real IdP without
 * one: `expectedState` validation happens client-side, before any token
 * endpoint request, so a callback URL that doesn't match the expected state
 * is rejected the same way whether or not the code inside it is real.
 */
describe.skipIf(!testKeycloakIssuerUrl)(
  "exchangeAuthorizationCode (requires SAF_TEST_KEYCLOAK_ISSUER_URL)",
  () => {
    it("rejects a callback whose state doesn't match the expected state (CSRF protection)", async () => {
      const config = await createOidcClient({
        issuerUrl: testKeycloakIssuerUrl!,
        clientId: TEST_CLIENT_ID,
        clientSecret: TEST_CLIENT_SECRET,
      });

      const callbackUrl = new URL(
        "http://localhost:3001/callback?code=irrelevant&state=state-from-callback",
      );

      await expect(
        exchangeAuthorizationCode(config, {
          callbackUrl,
          expectedState: "a-completely-different-expected-state",
          codeVerifier: "irrelevant-verifier",
          expectedNonce: "irrelevant-nonce",
        }),
      ).rejects.toThrow();
    });

    it("rejects a callback that carries an OAuth error response instead of a code", async () => {
      const config = await createOidcClient({
        issuerUrl: testKeycloakIssuerUrl!,
        clientId: TEST_CLIENT_ID,
        clientSecret: TEST_CLIENT_SECRET,
      });

      const callbackUrl = new URL(
        "http://localhost:3001/callback?error=access_denied&error_description=user+declined&state=s1",
      );

      // Not asserting the exact error message here — a callback with no
      // `code` param (an error response, per RFC 6749 §4.1.2.1) must never
      // resolve as if a real code were present, which is the property that
      // actually matters; the library's specific wording for *why* is an
      // implementation detail this test doesn't need to pin down.
      await expect(
        exchangeAuthorizationCode(config, {
          callbackUrl,
          expectedState: "s1",
          codeVerifier: "irrelevant-verifier",
          expectedNonce: "irrelevant-nonce",
        }),
      ).rejects.toThrow();
    });
  },
);

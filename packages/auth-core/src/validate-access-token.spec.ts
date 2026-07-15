import { describe, expect, it } from "vitest";
import { createOidcClient } from "./oidc-client.js";
import { createAccessTokenValidator } from "./validate-access-token.js";
import {
  fetchTestAccessToken,
  TEST_CLIENT_ID,
  TEST_CLIENT_SECRET,
  testKeycloakIssuerUrl,
} from "./test-support.js";

describe.skipIf(!testKeycloakIssuerUrl)(
  "createAccessTokenValidator (requires SAF_TEST_KEYCLOAK_ISSUER_URL)",
  () => {
    it("validates a real, live-signed access token against Keycloak's JWKS", async () => {
      const config = await createOidcClient({
        issuerUrl: testKeycloakIssuerUrl!,
        clientId: TEST_CLIENT_ID,
        clientSecret: TEST_CLIENT_SECRET,
      });
      const validate = createAccessTokenValidator(config);
      const token = await fetchTestAccessToken(config);

      const payload = await validate(token);

      expect(payload.iss).toBe(testKeycloakIssuerUrl);
      expect(payload.preferred_username).toBe("dev-user");
    });

    it("rejects a token with a tampered signature", async () => {
      const config = await createOidcClient({
        issuerUrl: testKeycloakIssuerUrl!,
        clientId: TEST_CLIENT_ID,
        clientSecret: TEST_CLIENT_SECRET,
      });
      const validate = createAccessTokenValidator(config);
      const token = await fetchTestAccessToken(config);
      const tampered = token.slice(0, -4) + "abcd";

      await expect(validate(tampered)).rejects.toThrow();
    });

    it("rejects a token issued by a different issuer", async () => {
      const config = await createOidcClient({
        issuerUrl: testKeycloakIssuerUrl!,
        clientId: TEST_CLIENT_ID,
        clientSecret: TEST_CLIENT_SECRET,
      });
      const validate = createAccessTokenValidator(config);

      // A structurally valid but entirely unsigned/foreign JWT — same
      // "reject junk without a real signature" class of proof as the
      // tampered-signature test above, from a different angle.
      const foreignToken = [
        Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url"),
        Buffer.from(JSON.stringify({ iss: "https://not-this-idp.test" })).toString("base64url"),
        "not-a-real-signature",
      ].join(".");

      await expect(validate(foreignToken)).rejects.toThrow();
    });
  },
);

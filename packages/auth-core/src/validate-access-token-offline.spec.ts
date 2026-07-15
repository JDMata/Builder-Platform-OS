import { describe, expect, it } from "vitest";
import * as client from "openid-client";
import { createAccessTokenValidator } from "./validate-access-token.js";

describe("createAccessTokenValidator — offline configuration checks", () => {
  it("throws immediately when the IdP metadata has no jwks_uri", () => {
    const config = new client.Configuration(
      {
        issuer: "https://idp.test",
        authorization_endpoint: "https://idp.test/auth",
        token_endpoint: "https://idp.test/token",
        // jwks_uri deliberately omitted
      },
      "test-client-id",
      "test-client-secret",
    );

    expect(() => createAccessTokenValidator(config)).toThrow(/no jwks_uri/);
  });
});

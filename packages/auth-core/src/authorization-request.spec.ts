import { describe, expect, it } from "vitest";
import * as client from "openid-client";
import { beginAuthorizationRequest } from "./authorization-request.js";

/**
 * `openid-client`'s `Configuration` has a public constructor accepting
 * static server metadata — used here to test URL-building logic for real
 * without a network call (discovery itself is exercised separately, against
 * the real Keycloak, in oidc-client.spec.ts).
 */
function offlineConfig(): client.Configuration {
  return new client.Configuration(
    {
      issuer: "https://idp.test",
      authorization_endpoint: "https://idp.test/protocol/openid-connect/auth",
      token_endpoint: "https://idp.test/protocol/openid-connect/token",
      jwks_uri: "https://idp.test/protocol/openid-connect/certs",
    },
    "test-client-id",
    "test-client-secret",
  );
}

describe("beginAuthorizationRequest", () => {
  it("builds a real authorization URL with PKCE, state, and nonce", async () => {
    const config = offlineConfig();

    const request = await beginAuthorizationRequest(config, {
      redirectUri: "http://localhost:3001/callback",
    });

    expect(request.url.origin + request.url.pathname).toBe(
      "https://idp.test/protocol/openid-connect/auth",
    );
    expect(request.url.searchParams.get("redirect_uri")).toBe("http://localhost:3001/callback");
    expect(request.url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(request.url.searchParams.get("code_challenge")).toBeTruthy();
    expect(request.url.searchParams.get("state")).toBe(request.state);
    expect(request.url.searchParams.get("nonce")).toBe(request.nonce);
  });

  it("defaults scope to openid when none is given", async () => {
    const config = offlineConfig();

    const request = await beginAuthorizationRequest(config, {
      redirectUri: "http://localhost:3001/callback",
    });

    expect(request.url.searchParams.get("scope")).toBe("openid");
  });

  it("honors an explicit scope", async () => {
    const config = offlineConfig();

    const request = await beginAuthorizationRequest(config, {
      redirectUri: "http://localhost:3001/callback",
      scope: "openid profile email",
    });

    expect(request.url.searchParams.get("scope")).toBe("openid profile email");
  });

  it("generates a fresh state/nonce/codeVerifier on every call", async () => {
    const config = offlineConfig();

    const first = await beginAuthorizationRequest(config, {
      redirectUri: "http://localhost:3001/callback",
    });
    const second = await beginAuthorizationRequest(config, {
      redirectUri: "http://localhost:3001/callback",
    });

    expect(first.state).not.toBe(second.state);
    expect(first.nonce).not.toBe(second.nonce);
    expect(first.codeVerifier).not.toBe(second.codeVerifier);
  });
});

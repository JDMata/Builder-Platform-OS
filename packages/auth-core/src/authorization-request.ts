import * as client from "openid-client";

export interface AuthorizationRequestOptions {
  readonly redirectUri: string;
  readonly scope?: string;
}

/**
 * What a caller (`api-gateway`, per ADR-0010's BFF pattern) must persist
 * server-side (never in a browser-readable cookie) between redirecting the
 * user to the IdP and handling the callback — `codeVerifier` and `state`
 * are required to validate the callback in `exchangeAuthorizationCode()`.
 */
export interface AuthorizationRequest {
  readonly url: URL;
  readonly state: string;
  readonly codeVerifier: string;
  readonly nonce: string;
}

/**
 * Builds a real Authorization Code + PKCE request (ADR-0010) — `state` and
 * `nonce` are generated fresh per request (CSRF and replay protection), the
 * PKCE code challenge is derived from a fresh `codeVerifier` via S256, never
 * reused across requests.
 */
export async function beginAuthorizationRequest(
  config: client.Configuration,
  options: AuthorizationRequestOptions,
): Promise<AuthorizationRequest> {
  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();
  const nonce = client.randomNonce();

  const url = client.buildAuthorizationUrl(config, {
    redirect_uri: options.redirectUri,
    scope: options.scope ?? "openid",
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
    state,
    nonce,
  });

  return { url, state, codeVerifier, nonce };
}

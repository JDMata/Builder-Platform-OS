import * as client from "openid-client";

export interface ExchangeCodeOptions {
  /** The full callback URL `api-gateway` received, including `code`/`state` query params. */
  readonly callbackUrl: URL;
  readonly expectedState: string;
  readonly codeVerifier: string;
  /**
   * The `nonce` `beginAuthorizationRequest()` generated for this same
   * request. Required whenever the authorization request included a
   * `nonce` (it always does here) — `openid-client` rejects the ID token's
   * `nonce` claim as unexpected if this isn't supplied, since an
   * unvalidated nonce defeats the replay protection it exists for.
   */
  readonly expectedNonce: string;
}

/**
 * The other half of the Authorization Code + PKCE flow `beginAuthorizationRequest()`
 * starts — validates `state` (CSRF), the PKCE verifier, and the `nonce`
 * (replay protection) all match, then exchanges the code for tokens against
 * the IdP's real token endpoint.
 */
export async function exchangeAuthorizationCode(
  config: client.Configuration,
  options: ExchangeCodeOptions,
): Promise<client.TokenEndpointResponse & client.TokenEndpointResponseHelpers> {
  return client.authorizationCodeGrant(config, options.callbackUrl, {
    expectedState: options.expectedState,
    pkceCodeVerifier: options.codeVerifier,
    expectedNonce: options.expectedNonce,
  });
}

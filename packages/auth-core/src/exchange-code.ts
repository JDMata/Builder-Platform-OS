import * as client from "openid-client";

export interface ExchangeCodeOptions {
  /** The full callback URL `api-gateway` received, including `code`/`state` query params. */
  readonly callbackUrl: URL;
  readonly expectedState: string;
  readonly codeVerifier: string;
}

/**
 * The other half of the Authorization Code + PKCE flow `beginAuthorizationRequest()`
 * starts — validates `state` (CSRF) and the PKCE verifier match, then
 * exchanges the code for tokens against the IdP's real token endpoint.
 */
export async function exchangeAuthorizationCode(
  config: client.Configuration,
  options: ExchangeCodeOptions,
): Promise<client.TokenEndpointResponse & client.TokenEndpointResponseHelpers> {
  return client.authorizationCodeGrant(config, options.callbackUrl, {
    expectedState: options.expectedState,
    pkceCodeVerifier: options.codeVerifier,
  });
}

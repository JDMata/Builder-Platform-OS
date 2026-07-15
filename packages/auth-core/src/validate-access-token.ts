import { createRemoteJWKSet, jwtVerify, type JWTPayload } from "jose";
import type * as client from "openid-client";

export type AccessTokenValidator = (token: string) => Promise<JWTPayload>;

/**
 * Real signature verification against the IdP's live JWKS endpoint (never a
 * hardcoded key, never `jwt.decode()` without verifying) — `jose`'s
 * `createRemoteJWKSet` caches and rotates keys automatically, matching how
 * every other real IdP (Entra ID, Okta, SAP IAS) publishes rotating keys.
 * `issuer`/`jwks_uri` come from the same `Configuration` `createOidcClient()`
 * already discovered — one source of truth, not a second hardcoded URL.
 */
export function createAccessTokenValidator(config: client.Configuration): AccessTokenValidator {
  const metadata = config.serverMetadata();
  if (!metadata.jwks_uri) {
    throw new Error("IdP metadata has no jwks_uri — cannot validate tokens");
  }
  const jwks = createRemoteJWKSet(new URL(metadata.jwks_uri));

  return async (token: string): Promise<JWTPayload> => {
    const { payload } = await jwtVerify(token, jwks, { issuer: metadata.issuer });
    return payload;
  };
}

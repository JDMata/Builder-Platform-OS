import * as client from "openid-client";

export interface OidcClientOptions {
  readonly issuerUrl: string;
  readonly clientId: string;
  readonly clientSecret: string;
}

/**
 * Real OIDC discovery against whichever IdP `issuerUrl` points at — Keycloak
 * in Sprint 0 dev, any OIDC-compliant IdP in production (ADR-0010: the
 * platform federates, never runs its own IdP, and this client is provider-
 * independent — nothing here is Keycloak-specific beyond the URL a caller
 * configures). `openid-client` v6's functional API (`discovery`,
 * `buildAuthorizationUrl`, `authorizationCodeGrant`, ...) is used directly
 * rather than wrapped further — this module exists to fix *how* the client
 * is constructed (client-secret-post auth, from config), not to add a second
 * abstraction on top of an already-minimal library.
 *
 * `openid-client`/`oauth4webapi` refuse plain-HTTP issuers by default (a real
 * production safeguard) — Keycloak's dev realm runs over HTTP, so a
 * non-HTTPS `issuerUrl` opts into `client.allowInsecureRequests` for
 * discovery and every subsequent request made with the resulting
 * `Configuration`, exactly the officially-documented pattern for this case.
 * Any HTTPS issuer (every real production IdP) is completely unaffected.
 */
export async function createOidcClient(options: OidcClientOptions): Promise<client.Configuration> {
  const server = new URL(options.issuerUrl);
  const execute = server.protocol === "https:" ? [] : [client.allowInsecureRequests];

  return client.discovery(
    server,
    options.clientId,
    undefined,
    client.ClientSecretPost(options.clientSecret),
    { execute },
  );
}

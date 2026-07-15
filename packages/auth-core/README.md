# @sap-app-factory/auth-core

## Purpose
AuthN session handling (OIDC) + `PolicyEnginePort`'s OPA adapter (ADR-0010, ADR-0011, [08-authentication-and-rbac.md](../../docs/architecture/08-authentication-and-rbac.md)). The platform never stores passwords and is never itself an IdP — this package federates to whichever OIDC-compliant IdP a tenant is configured against (Keycloak in Sprint 0 dev; Entra ID, Okta, SAP IAS in production), using `openid-client` v6 directly rather than a second abstraction on top of an already-minimal library.

## Ports
Implements `PolicyEnginePort` (`OpaPolicyEngineAdapter`). Everything else here (OIDC client, authorization request, code exchange, token validation, session cookie) is provider-independent session-handling logic `api-gateway`'s composition root wires in — not itself a port, since ADR-0010 doesn't call for one (the OIDC/session mechanism is internal to `api-gateway`, not swapped per adapter the way `LlmProviderPort` is).

## Sprint 0 scope (SAF-17)
- `createOidcClient()` — real discovery against the configured issuer. Non-HTTPS issuers (the dev Keycloak) opt into `allowInsecureRequests`; any HTTPS issuer (every real IdP) is unaffected.
- `beginAuthorizationRequest()` / `exchangeAuthorizationCode()` — real Authorization Code + PKCE (ADR-0010): fresh `state`/`nonce`/PKCE verifier per request, real token exchange against the IdP's token endpoint.
- `createAccessTokenValidator()` — real signature verification against the IdP's live JWKS (`jose`'s `createRemoteJWKSet`), never a hardcoded key.
- `sealSession()` / `unsealSession()` — a stateless, AES-256-GCM-encrypted session cookie (no session store exists yet; Redis is deliberately deferred, see `infra/README.md`). Returns `undefined` for anything invalid/expired/tampered — never throws on untrusted input.
- `OpaPolicyEngineAdapter` — real Rego evaluation against a real OPA server (`infra/opa/policies/authz.rego`), not an in-house policy DSL (explicitly rejected in ADR-0011's alternatives).

## Sprint 0 limitation, stated explicitly
Getting a real authorization **code** requires an actual browser login, which this environment can't automate. Every other piece is verified for real against the live Keycloak/OPA (see Testing below) — discovery, PKCE URL construction, JWT validation using a token obtained via Keycloak's Direct Grant (enabled on the dev realm's client **only** for this test-support purpose — production code never uses that grant type, Authorization Code + PKCE only), and code-exchange failure paths (bad state, bad code). The happy-path code exchange itself is exercised at the `api-gateway` level the same way, with the same documented gap.

## Testing
Real integration tests, gated behind `SAF_TEST_KEYCLOAK_ISSUER_URL`/`SAF_TEST_OPA_URL` (same convention as `SAF_TEST_POSTGRES_URL`) against `infra/docker-compose`'s Keycloak (with its imported `sap-app-factory` realm/client) and OPA. `test-support.ts` holds the test-only Direct Grant helper and dev credentials — excluded from this package's own build (`tsconfig.build.json`) so they never ship in `dist/`. `session-cookie.spec.ts` and `authorization-request.spec.ts` need no network at all — the latter uses `openid-client`'s `Configuration` constructor directly with static metadata, proving real URL-building logic without a live IdP.

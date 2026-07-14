# 0010 — Authentication via OIDC federation, Zero Trust, no custom IdP
Status: Accepted
Date: 2026-07-14

## Context
Enterprise customers already have an identity provider (Entra ID, Okta, SAP IAS, or self-hosted Keycloak) and expect to federate, not create yet another credential store. Zero Trust requires every request to be authenticated and authorized regardless of network origin, which rules out perimeter-only security models.

## Decision
The platform never stores passwords and is not an IdP. `api-gateway` performs OIDC Authorization Code + PKCE against the tenant's configured external IdP, issues short-lived signed access tokens, and acts as a BFF so `web` never receives raw tokens in browser JS. Service-to-service calls use short-lived, scoped workload identity tokens instead of static shared secrets. Secrets are abstracted behind `ports/secrets-vault.port.ts`. See [08-authentication-and-rbac.md](../architecture/08-authentication-and-rbac.md).

## Consequences
- Onboarding a new enterprise tenant is an IdP configuration exercise, not a code change.
- The platform inherits the customer's existing MFA/conditional-access policies for free, rather than reimplementing them.
- Sprint 0 runs Keycloak in docker-compose purely as a disposable local OIDC provider — this must never be mistaken for a production IdP recommendation.
- Requires every internal service call to carry and validate a workload identity token, which is nonzero implementation cost accepted upfront for the Zero Trust principle.

## Alternatives considered
- **Build a custom username/password + session IdP**: rejected outright — direct violation of Zero Trust and an unacceptable liability (password storage, MFA, breach exposure) for an enterprise B2B platform with no product need to own identity.
- **Trust internal network/VPC as an implicit boundary for service-to-service calls**: rejected — this is precisely the "trusted network" assumption Zero Trust exists to remove; plugin execution and multi-tenant isolation both depend on per-request authorization regardless of origin.

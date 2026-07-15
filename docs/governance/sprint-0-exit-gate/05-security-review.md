# 5. Sprint 0 Security Review

Against [SECURITY_BASELINE.md](../../../SECURITY_BASELINE.md)'s own OWASP Top 10 mapping and stated controls.

## Authentication

Real OIDC federation against Keycloak (dev IdP), Authorization Code + PKCE only for production code paths — verified: `beginAuthorizationRequest`/`exchangeAuthorizationCode` never use any other grant type. The Resource Owner Password (Direct Grant) mechanism exists **only** in test-only code (`auth-core/src/test-support.ts`, excluded from the package's own build) and this audit's own verification tooling (`tools/sprint0-demo`) — confirmed by grep that no production module references it. Access tokens are validated against a live JWKS (`jose`'s `createRemoteJWKSet`), never a hardcoded key. **Known, stated gap:** tokens aren't validated against `aud` — Keycloak's default token doesn't set it to the client_id without a custom mapper. Low severity (this is a defense-in-depth gap, not a bypass — the token is still signature- and issuer-validated), correct alongside real multi-tenant Keycloak configuration.

## Authorization

Real, working Rego policy (OPA), not stubbed — `opa test` 6/6 passing, plus real HTTP evaluation against a live OPA server verified in `auth-core`'s and `api-gateway`'s own integration tests. Separation-of-duties (prod approval requiring a distinct approver) is implemented as policy, not an inline role check — matches `SECURITY_BASELINE.md`'s explicit requirement.

## Secrets

**Verified: no secret appears in version control.** Every credential referenced anywhere in this codebase (`dev-only-client-secret`, `dev-user-password`, `saf_app_dev_password`, the session-cookie secret) is explicitly and consistently named as dev-only, generated fresh by `infra/docker-compose`'s own bootstrap on every `infra:reset`, never a real credential. `SecretsVaultPort` exists as a port with zero adapters (Technical Debt item 7) — every app reads `process.env` directly in its composition root, the correct pattern for Sprint 0, with no real vault-backed rotation yet. `TargetSystemConnection` (the higher-stakes, customer-credential concept) is domain-modeled only, not implemented — correctly deferred (SAF-29), since no real deployment-to-customer-system capability exists to need it.

## Encryption

TLS-in-transit is a stated policy, not yet enforceable in a pure local-Docker Sprint 0 (no real network boundary to terminate TLS at). At-rest encryption is the underlying Postgres/Docker volume's responsibility, not layered on top by this codebase — consistent with Sprint 0 scope; revisit once a real deployment target exists.

## Audit

Real, not bolted on: `AuditEvent` is derived from the event bus, persisted on a genuinely partitioned table (verified: `is a genuinely partitioned table` test passing against real Postgres), append-only by construction (no `update`/`delete` function exists on the domain type). `tools/sprint0-demo` proves a real audit event surviving a full persist/round-trip cycle. PII-vault/crypto-shredding (ADR-0017) is designed, not built — no real PII exists yet to protect.

## Zero Trust

Every port method carries `RequestContext` — verified structurally across every port and behaviorally via the tenant-isolation contract test (SAF-23, now confirmed run in CI). Scoped capability tokens for plugin invocations are designed (05-plugin-architecture.md) but not built — tied to the same SAF-25 process-isolation trigger as the plugin sandboxing gap.

## Dependency vulnerabilities

`pnpm audit` is **not usable** — verified by hand, it fails outright (`410 Gone`) because npm retired the endpoint it calls. `OSV-Scanner` was substituted (already named as the alternative in `11-git-and-cicd-strategy.md`'s own wording) and wired into `ci.yml`'s `security` job. Current scan (`osv-scanner scan --lockfile=pnpm-lock.yaml`, re-run fresh for this audit): **4 known vulnerabilities, 0 Critical, 1 High, 3 Medium** — see [Technical Debt Report](02-technical-debt-report.md) items 1–3 for the full triage (the High is a genuine runtime dependency needing a dedicated Sprint 5 story; the three Mediums are dev-tooling/framework-internal with negligible real exposure in this deployment shape).

## Secret scanning / SAST

`gitleaks` is wired into `ci.yml`'s `security` job (informational, `continue-on-error`, since it's never actually run on a GitHub-hosted runner yet — see Technical Debt item 9). CodeQL/SAST is **not wired** — GitHub Advanced Security licensing on this repository is unknown/undecided, and wiring a hard-required SAST step against unconfirmed licensing would silently block every future PR the moment it's unlicensed. Stated explicitly in `ci.yml`'s own comments, not silently absent.

## OWASP Top 10 mapping (per `SECURITY_BASELINE.md`'s table)

| Category | Status |
|---|---|
| Broken Access Control | Mitigated — OPA policy engine, RLS defense-in-depth, tenant-isolation contract tests |
| Cryptographic Failures | Partial — session cookies are AES-256-GCM sealed (real, tested); at-rest/in-transit TLS deferred to a real deployment target |
| Injection | Mitigated — Drizzle's parameterized query builder throughout, no raw string-concatenated SQL found in any repository |
| Insecure Design | Mitigated — ports/adapters, hexagonal layering mechanically enforced |
| Security Misconfiguration | Mitigated for what exists — dev-only defaults are clearly named as such everywhere; no default admin credential left unexamined |
| Vulnerable/Outdated Components | Partial — OSV-Scanner wired and run; 4 known findings triaged, none fixed yet (see above) |
| Identification/Auth Failures | Mitigated — OIDC federation, short-lived tokens, BFF pattern (tokens never reach browser JS) |
| Software/Data Integrity Failures | Not yet applicable — no build-once-deploy-many pipeline exists yet (`deploy-dev` is a placeholder); no container images are built or signed yet |
| Security Logging/Monitoring Failures | Mitigated — structured, correlation-ID-tagged logging (`observability`'s `createLogger`), OpenTelemetry tracing, real redaction (`redact()`, verified against injected secret-like field names) |
| SSRF | Mitigated for what exists — no arbitrary agent-directed network calls exist yet (no real LLM/MCP traffic in Sprint 0) |

## Overall

No critical security defect found. The two items worth Sprint 1 attention are the `drizzle-orm` vulnerability (Technical Debt item 1) and actually exercising `ci.yml`'s `security` job on a real runner once push is authorized (Technical Debt item 9) — both already tracked, neither blocking.

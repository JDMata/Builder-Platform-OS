# Security Baseline

This is the minimum security bar for every feature merged into this platform. It is not optional for "internal tools" or "just a prototype" — see [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md)'s Security First principle. Full architectural detail lives in [08-authentication-and-rbac.md](docs/architecture/08-authentication-and-rbac.md) and the relevant ADRs; this document is the checklist.

## Authentication

- The platform is never an identity provider and never stores passwords. Authentication federates to an external OIDC-compliant IdP (Entra ID, Okta, SAP IAS, or self-hosted Keycloak in dev) via Authorization Code + PKCE.
- `api-gateway` is the sole OIDC relying party and BFF; `web` never receives raw access/refresh tokens in browser JS — only an httpOnly session cookie.
- Access tokens are short-lived (~15 min); refresh happens through the IdP, never through a platform-issued long-lived token.
- Service-to-service calls use short-lived, scoped workload identity tokens, never static shared secrets or API keys checked into config.
- Reference: [ADR-0010](docs/adr/0010-oidc-federation-zero-trust.md).

## Authorization

- Hybrid RBAC + ABAC: roles grant coarse `resource:action` permission bundles scoped to tenant/workspace/project; `PolicyRule`s add attribute-based conditions (environment, data classification, plugin risk tier, separation-of-duties) on top.
- Authorization logic is externalized as policy-as-code (OPA/Cedar) behind `ports/policy-engine.port.ts` — never scattered `if (user.role === ...)` conditionals in application code.
- Enforced at two points: `api-gateway` (coarse, "can this user call this endpoint at all") and `application/*` use cases (fine-grained, resource-scoped) — defense in depth through one policy engine, not two divergent implementations.
- `connection:manage` and `connection:use` are distinct permissions for target-system connections, enabling separation of duties for tenants that require it.
- Reference: [ADR-0011](docs/adr/0011-hybrid-rbac-abac-policy-as-code.md).

## Secrets

- Platform operational secrets (IdP client secret, LLM/MCP provider keys) live behind `ports/secrets-vault.port.ts` — never in a checked-in `.env`, never hardcoded, never passed as a plain CLI argument that ends up in shell history or process listings.
- Customer target-system credentials (access to a customer's SAP BTP/CF/Kyma/on-prem landscape) are a **distinct, higher-stakes concept** — `TargetSystemConnection` — not just another secrets-vault entry. They are envelope-encrypted (tenant DEK wrapped by a KMS/HSM-held KEK, optionally customer-supplied for the Dedicated tenancy tier), fetched just-in-time for a single deployment operation, and never cached in worker memory beyond that operation.
- Every use of a target-system credential is recorded as an `AuditEvent` (actor, workflow run, target, purpose).
- No secret of any kind appears in logs, error messages, or LLM prompts sent to a third-party provider.
- Reference: [ADR-0015](docs/adr/0015-target-system-credential-management.md).

## Encryption

- In transit: TLS everywhere, including internal service-to-service traffic — no plaintext internal traffic on the assumption of a "trusted network" (see Zero Trust below).
- At rest: database and object storage encryption at rest is mandatory in every environment, including dev.
- Target-system credentials and any stored PII use envelope encryption (DEK/KEK split), not just "the database's at-rest encryption" — a compromised database backup alone must not be sufficient to recover plaintext credentials.
- BYOK (customer-supplied KEK) is available at the Dedicated tenancy tier — see [ADR-0013](docs/adr/0013-tenancy-isolation-tiering.md).

## Audit

- Every domain-meaningful state transition (`WorkflowRunCompleted`, `ArtifactApproved`, target-system credential use, an authorization denial) is recorded as an append-only `AuditEvent`, derived from the event bus, not bolted on as a separate logging pass.
- PII is never stored inline in `AuditEvent` — it lives in a per-subject encrypted vault referenced by opaque ID, so an erasure request can destroy the subject's key (crypto-shredding) without mutating or deleting audit rows. This is what reconciles append-only audit integrity with GDPR/CCPA erasure obligations.
- Audit data is partitioned and retained per a documented policy per data class, archived to object storage before a hot partition ages out — never silently deleted, never unboundedly retained by default.
- Reference: [ADR-0017](docs/adr/0017-data-retention-crypto-shredding.md).

## Zero Trust

- Every request — human or service-to-service, "internal" or external — is authenticated and authorized regardless of network origin. There is no code path that trusts a caller merely because it's on the same VPC or calling from another platform process.
- Plugin invocations carry a scoped capability token limiting exactly which MCP tools and LLM model profiles that invocation may use — least privilege per execution, not ambient access to everything the host process can reach.
- Any tool call that touches a target system, a credential, or crosses the tenant boundary (egress) requires a pre-approved allow-list at the workflow-step level or a human `ReviewGate` — regardless of whether the calling plugin's manifest technically permits the call. This is the concrete mitigation for prompt-injection-driven tool misuse.
- Every port method carries an explicit `RequestContext` (`tenantId`, `actorId`, `correlationId`, `tenancyTier`) — tenant isolation is an application-layer control independent of, not solely reliant on, database Row-Level Security.

## RBAC

- Baseline roles: `PlatformAdmin`, `TenantAdmin`, `DeliveryLead`, `Architect`, `Developer`, `Reviewer`, `Auditor`, `Viewer` — extensible, never hardcoded as literal string checks in application code (roles are data, resolved through the policy engine).
- Permissions are `resource:action` pairs scoped to a `tenant → workspace → project` hierarchy.
- Policy bundles are versioned and unit-tested like code — an authorization decision is traceable to a specific policy version, which is what makes this model auditable for ITIL/PMO purposes, not just functionally correct.

## Environment separation

- `dev`, `staging`, `prod` are fully separate deployments with separate credentials, separate IdP client registrations, and separate databases — no credential, API key, or connection string is ever shared across environments.
- Production data never flows into a lower environment for testing/debugging purposes without being anonymized/synthetic first — a customer's real requirement text or generated artifacts do not appear in a developer's local docker-compose.
- Deploys to `prod` require a manual approval gate tied to a change record (see [11-git-and-cicd-strategy.md](docs/architecture/11-git-and-cicd-strategy.md)); the same container image is promoted unchanged from staging to prod (build once, deploy many), never rebuilt per environment.

## Secure coding

- All external input (HTTP request bodies, LLM responses, MCP tool outputs, uploaded files) is validated and narrowed at the boundary before it enters domain/application code — treated as `unknown`, never trusted `any`.
- Output encoding is applied wherever generated content (including LLM-generated content) is rendered in a browser context, to prevent stored/reflected XSS from content the platform itself produced.
- Dependency scanning (`pnpm audit` / OSV), secret scanning, and SAST (CodeQL) run on every PR — a finding blocks merge unless explicitly triaged and accepted with a documented reason.
- Container images are signed (cosign) and scanned before the production approval gate.
- No use of `eval`, dynamic `require`/`import` of unvalidated paths, or shell-command construction via string concatenation of untrusted input, anywhere in the codebase.

## OWASP Top 10 — mapped mitigations

| OWASP category | Platform mitigation |
|---|---|
| Broken Access Control | Policy-as-code RBAC/ABAC enforced at two layers, `RequestContext`-scoped tenant checks independent of RLS |
| Cryptographic Failures | Envelope encryption for credentials/PII, TLS everywhere, at-rest encryption mandatory, BYOK for Dedicated tier |
| Injection | Parameterized queries only (Drizzle), no raw SQL string concatenation, input validated at every boundary before reaching domain code |
| Insecure Design | Threat modeling is a design input (Security First principle), not a post-hoc review; ADRs required for security-relevant decisions |
| Security Misconfiguration | Environment separation, no shared credentials across environments, infra-as-code for repeatable environment provisioning |
| Vulnerable and Outdated Components | Automated dependency/OSV scanning on every PR, blocking merge on unaddressed findings |
| Identification and Authentication Failures | OIDC federation, no platform-managed passwords, short-lived tokens, BFF pattern keeping tokens out of browser JS |
| Software and Data Integrity Failures | Signed container images, build-once-deploy-many, CI supply-chain checks (SAST, dependency audit) before the prod gate |
| Security Logging and Monitoring Failures | Structured, correlation-ID-tagged logging and OpenTelemetry tracing mandatory from Sprint 0 ([ADR-0012](docs/adr/0012-opentelemetry-mandatory.md)); append-only audit trail |
| Server-Side Request Forgery | MCP/LLM calls go through adapters with allow-listed capability bindings, not arbitrary agent-directed network calls; egress-touching tool calls require explicit approval (see Zero Trust above) |

# Changelog

No `CHANGELOG.md` existed before this entry — rather than fabricate Sprint 0's and Sprint 1's history retroactively (low-value, risks inventing detail that isn't real), this starts now, at VS-1's close, per the VS-1 Engineering Retrospective's `CI-A5` recommendation. Every future Vertical Slice close adds an entry here. For anything before this point, `git log` and the frozen governance snapshots under `docs/governance/` remain authoritative.

## Constitutional Review + governance patch v1.0.1 (2026-07-17)

**Reviewed:** the four constitutional documents (Architecture Foundation, Platform Experience Foundation, Engineering Canvas Specification, Experience Language Specification) via a ten-panel Constitutional Review across internal consistency, cross-document consistency, constitutional boundaries, missing invariants, governance, terminology, scalability, and future-proofing. Result: Constitutional Health Score 84/100, zero Critical findings, approved for freeze contingent on a governance-only patch.

**Fixed (v1.0.1, terminology/governance/versioning only — no conceptual redesign):** ECS's stale claim about the constitutional set's size (written when it was three documents, never updated after XLS became the fourth); AF's total lack of reciprocal constitutional status (no owner, no version, no awareness of its siblings); the complete absence of a constitutional precedence/conflict-resolution rule; inconsistent versioning (only 2 of 4 documents had a version number); and "Canvas" being used ambiguously in ECS to mean both the whole product and, elsewhere, specifically its spatial graph-view. Also renamed XLS's "Workspace Shell Language" (collided with the formally defined Workspace object) and trimmed a near-duplicate section between PXF and XLS. See `ED-014` for the full list.

**Result:** all four documents now versioned (AF/PXF/ECS/XLS v1.0.1), each with an identical constitutional-precedence clause, each pointing to `PROJECT_CONTEXT.md` as the single canonical enumeration of the set rather than restating a count that can go stale. No principle, philosophy statement, or Definition-of-Done requirement changed in substance.

## Post-baseline defect fix: OIDC callback redirect target + Discovery proxy error handling (2026-07-17)

**Fixed:** two defects found by re-driving the real login flow immediately after the nonce fix below. (1) `handleCallback`'s success redirect was a relative path (`/discovery/new`), which a browser resolves against whatever origin actually sent the response — always `api-gateway`'s own host, never `web`'s — so every real login landed on the wrong app entirely. (2) That wrong landing path happened to match `api-gateway`'s own `/discovery/*` proxy route, forwarding to `apps/orchestrator`; a non-JSON response from an unreachable/wrong process at that URL crashed the whole `api-gateway` process (no error handling existed in `discovery-proxy-routes.ts`), taking down every other in-flight request with it.

**Fix:** `ApiGatewayDependencies` gained `webUrl` (from `SAF_WEB_URL`, default `http://localhost:3000`); `handleCallback` now redirects to the absolute `${webUrl}/discovery/new`. `discovery-proxy-routes.ts` gained a `withErrorHandling` wrapper (mirroring `apps/orchestrator`'s existing pattern) around all four proxy handlers, returning a clean 502 instead of crashing; a regression test confirms the process survives a non-JSON upstream response. See `ED-013`, and the Continuous Improvement Backlog's `CI-A9`/`CI-A10`.

**Verified:** full monorepo validation suite clean (build/typecheck/test/lint/format/deps/fitness), plus a real-browser re-run of the entire Login → Idea Submission flow against real Keycloak, landing correctly on `web`'s real origin with zero console errors.

**Honest note on Sprint 1's closure:** both of these defects mean the original VS-1 Exit Gate Report's "business objective achieved" claim was not actually true when Sprint 1 was closed — only checked by automated tests that never drove a real browser. Sprint 1's *engineering* Definition of Done (code, tests, CI, docs) was genuinely met; the *business-objective* claim was not, until today. See `10-vs1-exit-gate-report.md` §16 and `BASELINE.md`'s update for the corrected record — the Sprint 1 Baseline tag itself is not reversed or reopened.

## Post-baseline defect fix: real OIDC login flow (2026-07-17)

**Fixed:** the Authorization Code + PKCE login flow was broken for any real browser login — `beginAuthorizationRequest()` generates a `nonce` for replay protection, but `apps/api-gateway`'s `PendingAuthorizationRequest`/`handleCallback` never stored or forwarded it to `exchangeAuthorizationCode()`. `openid-client` correctly rejected the resulting ID token's unvalidated `nonce` claim with `"unexpected JWT claim value encountered"`, failing every real login attempt with a 401.

**How this was found:** every existing automated test and demo script (`tools/sprint0-demo`, `tools/sprint1-demo`, `auth-core`'s own real-Keycloak-gated tests) deliberately uses Keycloak's Direct Grant instead of a real browser — explicitly because no browser was available in this environment before now. This is the first time the real Authorization Code flow was ever driven end-to-end by an actual browser (Playwright, launched to visually verify the VS-1 UI screens render), and it surfaced a defect no test in this suite could have caught until a browser existed to drive it.

**Fix:** `PendingAuthorizationRequest` now stores `nonce` alongside `state`/`codeVerifier`; `ExchangeCodeOptions` gained a required `expectedNonce` field, threaded through to `client.authorizationCodeGrant()`'s checks. Verified by re-driving the real login flow against real Keycloak: a real, HttpOnly `saf_session` cookie is now set after a genuine username/password login. Full monorepo build/typecheck/test/lint/format/deps/fitness re-verified clean, including auth-core's and api-gateway's real-Keycloak-gated test suites.

**New, separate finding — not fixed, out of scope for this fix:** `apps/api-gateway`'s Discovery proxy routes (`discovery-proxy-routes.ts`) have no top-level error handling — a non-JSON response from `apps/orchestrator` (e.g. if it's unreachable, or another process is occupying its port) crashes the whole `api-gateway` process instead of returning a clean error. Surfaced incidentally by a local port collision (Docker Desktop holding port 3000, so `apps/web`'s dev server fell back to port 3002 — `apps/orchestrator`'s own default port), not a defect in normal operation. Recorded for a future, separately-scoped fix.

## VS-1 — Discovery Workspace (2026-07-17)

Sprint 1's single, complete Vertical Slice: a user turns a business idea into an approved, real `Project` through one continuous, AI-guided flow — Login → Idea Submission → Clarification loop → Project Charter (review & confirm) → Project Ready.

**Added**
- Real domain + persistence for `RequirementDocument`/`Requirement`/`Clarification`/`AcceptanceCriterion` (`context-requirements`, `persistence-postgres/requirements`) and `Project` (`persistence-postgres/project`).
- The `structure-business-requirement` capability, backed by a real Anthropic Messages API integration (`adapter-llm-anthropic`).
- `CapabilityResolverPort`'s first real adapter (`adapter-capability-resolver-in-memory`) and `SecretsVaultPort`'s first real adapter (`adapter-secrets-vault-env`).
- The Discovery `WorkflowDefinition`, orchestrating idea capture, the bounded clarification loop, and confirmation/`Project` creation end to end (`apps/orchestrator`).
- `api-gateway`'s Discovery proxy routes, deriving identity from the session cookie rather than trusting the client.
- Five real Next.js screens in `apps/web`: Login, Idea Submission, Clarification Q&A, Project Charter, Project Ready.
- `tools/sprint1-demo`, an end-to-end demonstration script spawning the real built apps and driving them over real HTTP.
- The project's first real, fully green GitHub Actions CI run (including the real Postgres/Keycloak/OPA integration job).
- `CONTINUOUS_IMPROVEMENT_BACKLOG.md` and `ENGINEERING_DECISION_LOG.md`, established from the VS-1 Engineering Retrospective.

**Fixed**
- The `drizzle-orm` CVE, bumped to 0.45.2 across every `persistence-postgres/*` package.
- `esbuild@0.18.20` (via `drizzle-kit`'s deprecated `@esbuild-kit/core-utils`) and `postcss@8.4.31` (via `next`'s internal pin) — both forced to safe versions via root `pnpm.overrides`, flagged by CI's OSV scanner.

**Known limitations (disclosed, non-blocking — see the VS-1 Exit Gate Report, §12, and the Continuous Improvement Backlog)**
- Project Charter confidence badges are document-level, not per-requirement (`CI-B2`).
- No "Request Changes" reopen path on the Project Charter screen (`CI-B5`).
- No staged progress messaging during the structuring pass (`CI-B4`).
- A fixed single workspace, not a real selector (`CI-B8`).
- Default, undifferentiated actor permissions on every authenticated session (`CI-B3`).

## CTO Improvement Pack — VS-1 Category A closure (2026-07-17)

The five approved immediate improvements from the VS-1 Engineering Retrospective, completed before Sprint 2 planning.

**Added**
- `packages/http-server-kit` — `readJsonBody`/`stringField`, extracted from three independent copies across `apps/orchestrator`, `apps/api-gateway`, and `apps/web` (`CIP-001`).
- A "Runtime prerequisites" section in `CONTRIBUTING.md`, documenting `ANTHROPIC_API_KEY` as the one mandatory, no-default env var, plus local/testing/CI behavior for the whole `SAF_TEST_*` gated-test family (`CIP-004`).
- A "What each job validates" table in `docs/architecture/11-git-and-cicd-strategy.md`, mapping every CI job to Build/Unit/Integration/Real-Infrastructure/Fitness/Security coverage (`CIP-005`).

**Changed**
- `tools/scripts/banned-sap-keywords.mjs` now also scans every adapter-family package (`*-adapters/*`, `persistence-postgres/*`, `llm-adapters/*`) — 49 → 80 files scanned, 0 violations either way (`CIP-003`).

**Verified, no change needed**
- `CIP-002`: the sole registered capability (`structure-business-requirement`, priority 1) already matches `.ai/agents/requirements-analyst/agent.md`'s "Provides capabilities" declaration exactly — the retrospective's earlier claim that this field was missing (`CI-A3`) was a false positive (a grep pattern mismatch on the reviewer's part, not a real gap) and is corrected in `CONTINUOUS_IMPROVEMENT_BACKLOG.md`. A "Consumed capabilities" field was requested but is not a modeled concept in ADR-0020/ADR-0022 and was not added — see the CTO Improvement Pack completion report for why, and the smallest recommended alternative.

## Sprint 1 officially closed — Sprint 1 Baseline v1.0 (2026-07-17)

Governance closeout: `sprint1-baseline-v1.0` tagged at `ef7017c`. Full record: `BASELINE.md`'s Sprint 1 Baseline section (identification, deliverables, ADR/Capability Registry state, CI/test/documentation status, deferred backlog, open ADR candidates, risks carried into Sprint 2, and a `DEFINITION_OF_DONE.md` confirmation — including two honestly-flagged, not-fully-satisfied items: no separate human peer review beyond staged gate reviews, and no manual browser verification of the five `apps/web` screens in this environment). `BASELINE.md`'s Architecture Checksum list was found stale (22 ADRs/19 architecture docs listed, actually 23/20) and corrected at this closure. **Sprint 1 status: OFFICIALLY CLOSED.**

# Changelog

No `CHANGELOG.md` existed before this entry — rather than fabricate Sprint 0's and Sprint 1's history retroactively (low-value, risks inventing detail that isn't real), this starts now, at VS-1's close, per the VS-1 Engineering Retrospective's `CI-A5` recommendation. Every future Vertical Slice close adds an entry here. For anything before this point, `git log` and the frozen governance snapshots under `docs/governance/` remain authoritative.

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

# Sprint 0 Architectural Baseline

## Executive Summary

**Sprint 0 objective:** prove every architectural seam decided in [docs/architecture/](docs/architecture/) exists, is mechanically enforced, and runs end to end — with zero SAP-specific logic in the core and zero real agent/generation behavior. Not to ship a product; to prove the foundation a 10-year platform can be built on without a rewrite.

**What Sprint 0 accomplished:** all 22 ADRs accepted and implemented as decided; ten bounded contexts scaffolded with real domain aggregates; thirteen ports defined, with real, contract-tested adapters for the eight that have one; four composition-root apps (`api-gateway`, `web`, `orchestrator`, `worker`) built and wired; real OIDC authentication against Keycloak; a real OPA policy engine; a real transactional-outbox event bus; a real (in-memory, deliberately not durable yet) workflow engine; a real plugin (`fiori-generator`) proving the plugin/capability model end to end; real OpenTelemetry tracing with verified cross-process propagation; a real CI pipeline with mandatory architecture-fitness gates; and a real, runnable end-to-end vertical-slice demonstration (`pnpm run demo:sprint0`) proving all of the above together, not in isolation. Full detail: [docs/backlog/sprint-0-backlog.md](docs/backlog/sprint-0-backlog.md).

**Baseline approval date:** 2026-07-15, following the Sprint 0 Exit Gate audit ([docs/governance/sprint-0-exit-gate/](docs/governance/sprint-0-exit-gate/README.md)), verdict **GO WITH MINOR CORRECTIONS**.

**Baseline version:** `Sprint 0 Baseline v1.0` — git tag `sprint0-baseline-v1.0`.

---

## Sprint 1 Baseline v1.0

This document remains the frozen Sprint 0 snapshot below — not retroactively rewritten. This section is Sprint 1's own baseline record, the same governance event as Sprint 0's above, additive to it, not a replacement.

### Identification

| Field | Value |
|---|---|
| Sprint identifier | Sprint 1 — Discovery Workspace (Release R0.2) |
| Baseline version | `Sprint 1 Baseline v1.0` |
| Git commit reference | `ef7017c44fae4ea0ceb2c338210a68b4cc116ace` (`main`, `https://github.com/JDMata/Builder-Platform-OS`) |
| Git tag | `sprint1-baseline-v1.0` (created and pushed at this closure — see below; matches `sprint0-baseline-v1.0`'s established naming convention, kebab-case with a `v`-prefixed version, not the `Sprint-1.0` form) |
| Date created | 2026-07-17 |
| Baseline approval | Sprint 1 Exit Gate: **PASSED**; CTO Review: **APPROVED**; this closeout: **Sprint 1 OFFICIALLY CLOSED** |

### Sprint objective

Ship VS-1 (Discovery Workspace), the platform's first complete, user-visible vertical slice: a business idea becomes an approved, real `Project` through one continuous, AI-guided flow — Login → Idea Submission → Clarification loop → Project Charter (review & confirm) → Project Ready.

### Business deliverables completed

- A user can sign in, describe a business idea in their own words, answer the AI agent's follow-up questions, review the structured result, and approve it into a real, named `Project` — no dashboard, no upfront project-creation form, matching the approved Product Design Review exactly.
- Every step of that journey is real: a real LLM structures the idea, real clarifications are asked and answered, a real `Project` is created and persisted, nothing is mocked or simulated in the request path a user actually exercises.

### Vertical Slices completed

**VS-1 — Discovery Workspace.** The sprint's only Vertical Slice (VS-2 was merged into it during Sprint 1's own execution-package revision — there was never a second, separate slice this sprint). 19 of 19 engineering tasks complete. Full detail: [docs/execution/sprint-1/10-vs1-exit-gate-report.md](docs/execution/sprint-1/10-vs1-exit-gate-report.md).

### CTO Improvement Pack completed

CIP-001 through CIP-005, all completed 2026-07-17 (`ef7017c`):
- **CIP-001** (extract `readJsonBody`/`stringField` duplication) — done, `packages/http-server-kit`.
- **CIP-002** (capability declaration consistency) — verified already correct ("Provides capabilities" matches the real registry); "Consumed capabilities" is not implemented — it isn't a modeled concept in `ADR-0020`/`ADR-0022`, and adding one would be a new architectural field a Category A item isn't authorized to introduce; recorded as `CI-A8` for a future small ADR addendum instead.
- **CIP-003** (fitness function adapter-package coverage) — done, 49 → 80 files scanned, 0 violations either way.
- **CIP-004** (runtime prerequisite documentation) — done, `CONTRIBUTING.md`.
- **CIP-005** (CI pipeline documentation) — done, `docs/architecture/11-git-and-cicd-strategy.md`.

### ADR versions in force

All **23** ADRs `Accepted`; none `Proposed`, `Superseded`, `Deprecated`, or `Rejected`. The 22 decided at the Sprint 0 baseline, plus [ADR-0023](docs/adr/0023-platform-kernel-and-platform-pack-architecture.md) (Platform Kernel and Platform Pack Architecture, 2026-07-15, a strategic pre-Sprint-1 alignment decision, no accompanying code change). No ADR was modified, superseded, or newly required by Sprint 1's implementation or by the CTO Improvement Pack. Full index: [ARCHITECTURE_DECISION_INDEX.md](ARCHITECTURE_DECISION_INDEX.md).

### Capability Registry version

No package in this monorepo has been versioned past `0.0.0` yet (no Changesets release has been cut) — `context-capability-registry`'s own package version is `0.0.0`, unchanged. The registry's *content* state is the meaningful figure: **one real, registered capability**, `structure-business-requirement` (provider `requirements-analyst`, `providerType: "agent"`, `priority: 1`), verified consistent between `.ai/agents/requirements-analyst/agent.md`'s "Provides capabilities" declaration and the real registration in `apps/orchestrator/src/plugin-loader.ts`.

### Platform maturity summary

Per [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md) (updated at this closure): Sprint 1's row moved from "Execution Ready" to **Complete**. Six Capability Maturity Matrix rows moved from planned/not-started to 🟢 for Sprint 1: Workflow Engine, Capability Registry, LLM Gateway, Security, Observability, DevOps, Governance. Plugin SDK remains 🔒 (process/container isolation, unchanged, now a named Sprint 2 prerequisite).

### CI status

**Green.** Latest run on `main`: [29547878049](https://github.com/JDMata/Builder-Platform-OS/actions/runs/29547878049) (the CTO Improvement Pack commit) — all four jobs (`build-lint-typecheck-test`, `integration`, `security`, `deploy-dev`) passed. This is the second consecutive fully green run; the first ([29545999065](https://github.com/JDMata/Builder-Platform-OS/actions/runs/29545999065)) was Task 1.19's original real-CI proof.

### Test status

All suites passing across the full monorepo (63/63 Turborepo tasks at last full run). Notable: 23 `orchestrator` + 17 `api-gateway` + 20 `web` tests for the new Discovery workflow/screens, 7 new `http-server-kit` tests (100% coverage), plus every pre-existing package's own suite unchanged. Env-gated real-infrastructure suites (`SAF_TEST_POSTGRES_URL`/`SAF_TEST_OPA_URL`/`SAF_TEST_KEYCLOAK_ISSUER_URL`) ran for real in CI's `integration` job; `SAF_TEST_ANTHROPIC_API_KEY`-gated suites did not (deliberately never configured in CI — see `CONTRIBUTING.md`'s Runtime Prerequisites section) and remain unverified against the real Anthropic API in this environment.

### Documentation status

**Synchronized as of this closure** (see Validation below for what was found and fixed to get there): `PROJECT_CONTEXT.md`, `ROADMAP.md`, `PLATFORM_MATURITY.md`, `CHANGELOG.md`, this document, `CONTINUOUS_IMPROVEMENT_BACKLOG.md`, `ENGINEERING_DECISION_LOG.md`, `CONTRIBUTING.md`, `docs/architecture/11-git-and-cicd-strategy.md`, and `docs/execution/sprint-1/10-vs1-exit-gate-report.md`.

### Known deferred backlog items (carried into Sprint 2 and beyond)

- **SAF-24** (Temporal spike) and **SAF-25** (plugin isolation) — correctly not needed for VS-1 (an agent invocation, not third-party generation logic); SAF-25 is now a **named hard prerequisite** before Sprint 2 introduces real generation logic (`CONTINUOUS_IMPROVEMENT_BACKLOG.md`'s `CI-B6`).
- **SAF-26 through SAF-38** — unchanged from the Sprint 0 baseline's Deferred Decisions list below; none newly triggered by Sprint 1.
- **`CONTINUOUS_IMPROVEMENT_BACKLOG.md`'s Category B** (8 items: shared HTTP-handler kit, per-requirement confidence badges, real claims-to-permission mapping, staged progress messaging, "Request Changes" reopen path, plugin isolation, branch-coverage improvements, real workspace selector) and **Category C** (5 items, all pre-identified by the pre-Sprint-1 Platform Kernel review: `PlatformPack` aggregate, `PortCategory` rename, `.ai/knowledge/` relocation, workflow-engine durability revisit, feature-flag mechanism decision).

### Open ADR candidates

**None currently drafted.** All 23 existing ADRs are `Accepted`. Three items are pre-identified as *future* ADR candidates, not yet drafted, each requiring its own architecture-review pass before implementation (`CONTINUOUS_IMPROVEMENT_BACKLOG.md`'s `CI-C1`/`CI-C2`/`CI-C3`): the `PlatformPack` aggregate, the `PortCategory.sap-connectivity` rename, and the `.ai/knowledge/sap-domain/` relocation. A fourth, smaller candidate — a "Consumes capabilities" agent-template field — was surfaced by the CTO Improvement Pack (`CI-A8`) and is recorded for when a real multi-agent consumption scenario exists to design it against.

### Risks carried into Sprint 2

- **R17** (plugin isolation deferred) — **the single most important risk entering Sprint 2**; explicitly named as a hard blocker before real generation logic ships.
- **R16** (in-house workflow engine durability) — VS-1 exercised it successfully but only at small, bounded scale (max 5 clarification rounds); the Temporal-class comparison spike remains genuinely open.
- **R18** (no per-tenant feature-flag mechanism) — not urgent for VS-1's single-persona flow; will matter the moment Sprint 2 needs any tier-gated capability.
- No new risk was introduced by Sprint 1 beyond what the existing register ([12-risks-and-technical-debt.md](docs/architecture/12-risks-and-technical-debt.md)) already tracked.

### Definition of Done confirmation

Checked against [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md) directly, not asserted from memory:

- **Code, Tests, Quality gates, Observability** — ✅ satisfied: acceptance criteria implemented without undiscovered scope, `dependency-cruiser` clean, coverage present on every new file, all CI quality gates green, no fitness function weakened, every new port/HTTP call wrapped in `withSpan`, `requirements.document.captured.v1` emitted for the one new domain-meaningful transition.
- **Documentation** — ✅ satisfied: every touched package has an accurate README (`fitness:readmes` passes, 36 packages), architecture docs updated where this work made them inaccurate (this baseline, `11-git-and-cicd-strategy.md`, `PLATFORM_MATURITY.md`).
- **Security & compliance** — ✅ satisfied: no secret/PII introduced, `RequestContext` threaded through every new port call, session-derived identity verified by a real spoofing-attempt test, `PolicyEnginePort`/OPA authorization checks in place for every new use case.
- **Review & delivery — two items honestly flagged, not silently claimed:** (1) *"At least one approval from someone other than the author"* — this sprint's review discipline took the form of staged human gate reviews (Readiness Review, Exit Gate approval, CTO Improvement Pack review, this closeout) rather than a traditional per-PR peer-engineer approval; no separate human engineer reviewed the diffs line by line. (2) *"Deployed to `dev` and manually verified... before the story is closed"* — `deploy-dev` remains a stated placeholder (no real target exists yet, unchanged from Sprint 0), and the five `apps/web` screens have been verified by automated test only in this environment — no human has clicked through them in a real browser, and `tools/sprint1-demo`'s full real-Anthropic run has never executed here (no key available). Recorded honestly rather than claimed.

---

## Repository

### Repository structure

Monorepo, pnpm workspaces + Turborepo (ADR-0001). Top-level layout, each folder mapping to exactly one architectural layer (see [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for the full canonical tree and rationale):

```
apps/            composition roots — the only place concrete adapters are constructed
packages/        ports, contexts (domain+application), adapters, cross-cutting infra
plugins/         SAP-specific capability implementations — structurally outside the core
tools/           repo maintenance scripts + the Sprint 0 vertical-slice demo
docs/            architecture, ADRs, backlog, governance
.ai/             the AI Workspace — agent/prompt/policy authoring surface
.github/         CI workflow, PR template
infra/           docker-compose local dev stack, OPA policies, otel-collector config
```

### Monorepo organization

- **Workspace manager:** pnpm 10.20.0 (`packageManager` pinned in root `package.json`).
- **Build orchestration:** Turborepo 2.x (`turbo.json` — `build`/`typecheck`/`test`/`dev` tasks, `build` before `lint`/`typecheck` deliberately, since cross-package type-aware resolution needs `dist/` to exist first).
- **Package resolution:** every workspace package resolves another via `package.json` `exports` pointing at `dist/`, never source directly.
- **Versioning:** Changesets, for the packages meaningful enough to publish independently (`ports`, `plugin-sdk`, and any package a future consumer needs a semver contract from).

### Package inventory (27 real workspace packages, plus the 4 composition-root apps listed separately below — 31 workspace packages in total)

**Ports** (1): `packages/ports` — 13 port interfaces: `LlmProviderPort`, `McpConnectionPort`, `EventBusPort`, `Repository<T>`, `ObjectStorePort`, `SecretsVaultPort`, `WorkflowEnginePort`, `PolicyEnginePort`, `RateLimiterPort`, `TenantConnectionResolverPort`, `CapabilityResolverPort`, `GraphStorePort`, `SearchIndexPort`.

**Bounded contexts** (10): `context-identity`, `context-project`, `context-requirements`, `context-capability-registry`, `context-workflow`, `context-llm-gateway`, `context-mcp-registry`, `context-generation`, `context-governance`, `context-digital-twin`. (An eleventh, `context-notification`, is scheduled — see Deferred Decisions.)

**Cross-cutting / orchestration packages** (5): `llm-core`, `mcp-core`, `events-core`, `resilience-kit`, `observability`.

**Adapters** (7): `llm-adapters/anthropic`, `mcp-adapters/stdio`, `events-adapters/postgres-outbox`, `workflow-engine-adapters/in-memory`, `persistence-postgres/identity`, `persistence-postgres/governance`, `auth-core` (OIDC session handling + `OpaPolicyEngineAdapter`).

**Plugin infrastructure** (2): `plugin-sdk` (the contract every plugin implements), `testing-kit` (shared contract-test suites).

**Plugins** (1): `plugins/fiori-generator` — the one real, Sprint-0-scoped example plugin.

**Tools** (1): `tools/sprint0-demo` — the vertical-slice demonstration.

### Application inventory (4 composition roots)

| App | Port (default) | Responsibility |
|---|---|---|
| `apps/api-gateway` | 3001 | Public API surface, AuthN/AuthZ enforcement — the OIDC/session termination point |
| `apps/web` | 3000 (Next.js default; no port pinned in `package.json`) | Control-plane UI, BFF pattern — talks to `api-gateway` only |
| `apps/orchestrator` | 3002 | Workflow/agent orchestration, plugin loading, capability registration |
| `apps/worker` | 3003 | Executes plugin invocations via `plugin-sdk`'s `execute()` seam |

### Infrastructure inventory

`infra/docker-compose/docker-compose.yml` — one-command local dev stack (`pnpm run infra:up`/`infra:down`/`infra:reset`):

| Service | Image | Purpose |
|---|---|---|
| `postgres` | `postgres:16` | Schema-per-context persistence, RLS, transactional outbox |
| `keycloak` | `quay.io/keycloak/keycloak:26.0` | Dev OIDC identity provider, `--import-realm` bootstrapped |
| `opa` | `openpolicyagent/opa:0.70.0` | Real Rego policy evaluation (`PolicyEnginePort`) |
| `otel-collector` | `otel/opentelemetry-collector:0.114.0` | OTLP trace ingestion, `debug` exporter |

Redis and MinIO are **deliberately not included** — no currently-scheduled consumer needs either yet (see `infra/README.md`).

---

## Architecture

- **Clean Architecture / Hexagonal Architecture** (ADR-0002): domain → application → ports → adapters, one direction only, mechanically enforced by `dependency-cruiser.config.cjs` (10 rules, 0 violations across 617 modules / 918 dependencies). Composition roots (`apps/*`, `tools/sprint0-demo`) are the only place a concrete adapter is constructed.
- **Domain-Driven Design**: ten bounded contexts, each owning its own aggregates, never sharing a domain/application-layer import with another context (`application-no-cross-context`, mechanically enforced). Cross-context communication is event-only or via ports.
- **Event-Driven Architecture** (ADR-0007): real transactional outbox over Postgres `LISTEN`/`NOTIFY`, versioned past-tense event types, at-least-once delivery with idempotent-handler expectation.
- **Capability-based orchestration** (ADR-0022): workflows request a `Capability`, never a specific agent or plugin; a `CapabilityProvider` resolves who does the work at runtime.
- **Plugin architecture** (ADR-0006): SAP-specific logic lives only in `plugins/*`, mechanically enforced by a banned-keyword guard and a `plugin-import-boundary` dependency-cruiser rule, both verified against real injected violations.
- **Local-first architecture**: the entire platform dev loop runs on one `docker-compose` file, no cloud dependency; generated applications get the same locality via ADR-0019's `local-poc` execution profile (designed, not yet built — no application-generating plugin exists yet).
- **Project Digital Twin** (ADR-0021): fully designed (event-projected knowledge graph, provenance-tagged edges, registry-checked node/relationship types) — not yet implemented, correctly scoped to Sprint 1/2 (SAF-34–37).
- **Zero Trust** (ADR-0010): every port method carries an explicit `RequestContext` (tenant, actor, correlation id) rather than ambient state; real OIDC federation, never a platform-managed password.

Full validation, principle by principle, with evidence: [docs/governance/sprint-0-exit-gate/03-architecture-validation-report.md](docs/governance/sprint-0-exit-gate/03-architecture-validation-report.md).

---

## Bounded Contexts

| Context | Responsibility | Owned aggregate(s) | Owned event(s) | Owned capability(ies) |
|---|---|---|---|---|
| `context-identity` | Tenants, roles, permissions | `Tenant`, `Role`, `Permission` | *(none published yet — Tenant persistence is direct, not event-sourced)* | — |
| `context-project` | Workspaces, target-system connections | `Workspace`, `TargetSystemConnection` | `workspace.created.v1` *(demo-illustrative; no application-layer use case publishes it structurally yet)* | — |
| `context-requirements` | Requirement capture | `Requirement` | `requirements.document.captured.v1` *(designed, not yet emitted)* | — |
| `context-capability-registry` | Capability/provider registry | `Capability`, `CapabilityProvider`, `CapabilityPlugin` | — | Registry owner for every capability below |
| `context-workflow` | Workflow run state | `WorkflowRun` | `workflow.run.started.v1`, `.completed.v1`, `.failed.v1`, `.cancelled.v1`, `workflow.step.completed.v1` | — |
| `context-llm-gateway` | Model profile registry | `ModelProfile` | — | — |
| `context-mcp-registry` | MCP server registration | `McpServerRegistration` | `mcp.tool.invocation_denied.v1` *(designed, not yet emitted)* | — |
| `context-generation` | Generated artifacts | `Artifact` | `generation.job.started.v1`, `.completed.v1`, `.failed.v1`, `generation.artifact.review_requested.v1` *(designed, not yet emitted)* | — |
| `context-governance` | Audit, risk, compliance | `AuditEvent`, `Risk` | `governance.audit.recorded.v1`, `.risk.identified.v1`, `.incident.reported.v1`, `.problem.identified.v1`, `.change.requested.v1` *(all designed; only audit persistence is real today)* | — |
| `context-digital-twin` | Knowledge graph structure | `DigitalTwinNode` | `digitaltwin.node.upserted.v1`, `.edge.upserted.v1` *(designed, not yet emitted — no implementation exists)* | — |

`context-capability-registry` is the registry, not an owner of individual capabilities — see the Capability Catalog below for what's actually registered.

---

## Capability Catalog

Exactly **one** real, registered capability exists as of this baseline — an honest reflection of Sprint 0's scope (one first-party plugin, proving the mechanism, not populating a catalog).

| Identifier | Provider | Implementation | Expected inputs | Expected outputs |
|---|---|---|---|---|
| `generate-fiori-elements-app` | `fiori-generator` (plugin, priority 1) | `plugins/fiori-generator`'s `FioriGeneratorPlugin`, invoked via `plugin-sdk`'s `execute()` seam | `GenerationInput` (`requirementRefs`, `targetEnvironmentRef`, `targetExecutionProfile`, `parameters`) | One `GeneratedArtifact` of type `fiori-elements-app` — a fixed Sprint 0 placeholder, no real Fiori generation logic yet |

`CapabilityResolverPort` (the port this resolution would eventually run through as a real adapter) has no implementation yet — Sprint 0's demonstrations compose the underlying domain resolution function (`resolveCapabilityProvider`) directly, correct for "one provider, no runtime-swappable resolution needed yet."

---

## Event Catalog

**Real, currently published in code:**

| Event | Producer | Consumer(s) | Payload owner |
|---|---|---|---|
| `workflow.run.started.v1` | `adapter-workflow-engine-in-memory` | Governance, Notification *(designed consumers; no real subscriber exists yet beyond `tools/sprint0-demo`'s own demonstration subscriber)* | `context-workflow` |
| `workflow.run.completed.v1` | `adapter-workflow-engine-in-memory` | Governance, Notification | `context-workflow` |
| `workflow.run.failed.v1` | `adapter-workflow-engine-in-memory` | Governance, Notification | `context-workflow` |
| `workflow.run.cancelled.v1` | `adapter-workflow-engine-in-memory` | Governance, Notification | `context-workflow` |
| `workflow.step.completed.v1` | `adapter-workflow-engine-in-memory` | Governance | `context-workflow` |
| `generation.job.started.v1` | `apps/worker` | Governance, Notification | `context-generation` |
| `generation.job.completed.v1` | `apps/worker` | Governance, Notification | `context-generation` |
| `generation.job.failed.v1` | `apps/worker` | Governance, Notification | `context-generation` |

**Designed (in [06-event-model.md](docs/architecture/06-event-model.md)), not yet emitted by any real producer** — correctly absent, since no application-layer use case yet exists to produce them: `requirements.document.captured.v1`, `generation.artifact.review_requested.v1` / `.approved.v1` / `.rejected.v1`, `governance.audit.recorded.v1` / `.risk.identified.v1` / `.incident.reported.v1` / `.problem.identified.v1` / `.change.requested.v1`, `project.deployment.started.v1`, `mcp.tool.invocation_denied.v1`, `digitaltwin.node.upserted.v1` / `.edge.upserted.v1`.

All events are versioned (`.vN` suffix), past-tense, and delivered at-least-once via the real transactional outbox (`PostgresOutboxAdapter`) — verified directly (ordering, rollback, `SKIP LOCKED` redelivery).

---

## Technology Baseline

| Category | Technology |
|---|---|
| **Languages** | TypeScript (strict mode, `noUncheckedIndexedAccess`, `NodeNext`/`verbatimModuleSyntax`), Node.js 24.13.0 (pinned via `.nvmrc`) |
| **Frameworks** | Next.js 15 (`apps/web`); plain `node:http` elsewhere (deliberately no framework chosen yet — `04-service-boundaries.md`) |
| **Monorepo tooling** | pnpm 10.20.0, Turborepo 2.x, Changesets |
| **Infrastructure** | Docker Compose (local dev only) — Postgres 16, Keycloak 26, OPA 0.70.0, OpenTelemetry Collector 0.114.0 |
| **Testing** | Vitest 4.x + `@vitest/coverage-v8`; real-infra-gated integration suites (`describe.skipIf`); shared `testing-kit` contract-test factories per port |
| **Observability** | OpenTelemetry (`@opentelemetry/api` 1.9.x, SDK 2.9.x), OTLP/HTTP export, `packages/observability`'s `startTracing`/`withSpan`/`createLogger` (structured, redacting) |
| **Security** | Keycloak (OIDC, Authorization Code + PKCE), `jose` (JWT validation), OPA/Rego (policy-as-code), `openid-client` v6, AES-256-GCM session sealing, OSV-Scanner (dependency scanning), `gitleaks` (secret scanning) |
| **Persistence** | PostgreSQL 16, Drizzle ORM 0.36.4, schema-per-context, Row-Level Security (non-superuser runtime role), monthly-partitioned audit table |
| **CI/CD** | GitHub Actions (`.github/workflows/ci.yml`) — build, lint (ESLint + `dependency-cruiser` + Prettier), typecheck, unit + contract tests, architecture fitness checks, real-infra integration tests, security scan, placeholder dev-deploy |

---

## Approved ADRs

All 22 ADRs are `Accepted` (decided 2026-07-14). Full table with affected packages, related ADRs, and impact levels: [ARCHITECTURE_DECISION_INDEX.md](ARCHITECTURE_DECISION_INDEX.md).

---

## Accepted Technical Debt

Only debt *intentionally* accepted as a Sprint 0 scope decision — not oversight, not a shortcut. Full detail and severity classification: [docs/governance/sprint-0-exit-gate/02-technical-debt-report.md](docs/governance/sprint-0-exit-gate/02-technical-debt-report.md).

| Item | Rationale | Expected resolution |
|---|---|---|
| Workflow engine is in-memory, not durable | Growing real persistence/dispatch before the Temporal-class comparison spike would make that spike a sunk-cost evaluation, not an honest one (Architecture Inventory Review, debt item #5) | Sprint 1 (SAF-24 spike, then a real decision) |
| Plugin execution is in-process, no isolation | `execute()`'s seam exists specifically so isolation can be added later without changing plugin authors' code; nothing yet runs untrusted, real generation logic | Sprint 1, before the first plugin ships real logic (SAF-25) |
| No Redis / no BullMQ / no shared resilience state | No currently-scheduled consumer needs cross-replica state yet — every Sprint 0 app runs as one replica | Sprint 5+ (SAF-26, SAF-27), when multi-replica load is real |
| No MinIO / object storage adapter | Nothing yet generates or stores a real file artifact | When the first plugin needs one |
| `CapabilityResolverPort` / `SecretsVaultPort` have no adapter | Exactly one capability provider exists; every secret today is a dev-only `.env` default in a composition root | The Sprint 1 story that first needs a second provider type or secret rotation |
| `drizzle-orm@0.36.4` has a known High-severity CVE | A 9-minor-version bump touching migration code twice found to have real bugs needs its own dedicated regression cycle, not a drive-by fix | Sprint 1, dedicated story |
| CI has never executed on a real GitHub Actions runner | Push is deliberately deferred pending authorization; every underlying command is independently verified locally | Immediately once push is authorized |

---

## Deferred Decisions

Every item below has a named ADR and an explicit trigger condition — deliberately postponed, not undecided:

- **SAF-24** — Temporal/durable-execution build-vs-adopt decision (ADR-0008 revision) — after a timeboxed spike, on real data.
- **SAF-25** — Plugin process/container isolation (ADR-0006 revision) — before the first plugin with real generation logic.
- **SAF-26** — Redis Streams event transport (ADR-0007 revision) — before real event volume arrives.
- **SAF-27** — Shared, Redis-backed resilience state (ADR-0016) — before multi-replica `orchestrator`/`worker`.
- **SAF-28** — Read-models / CQRS projections (ADR-0014) — before the first real dashboard view.
- **SAF-29** — `TargetSystemConnection` envelope encryption / KMS (ADR-0015) — before the first real deployment-to-customer-system capability.
- **SAF-30** — Tenancy tier (Pooled/Silo/Dedicated) implementation (ADR-0013) — before the first Silo/Dedicated customer commitment.
- **SAF-31** — `generated-app-kit` (ADR-0019) — before the first application-generating plugin ships real logic.
- **SAF-32** — `agent-sdk` + `.ai/` loader (ADR-0020) — before any real agent can run.
- **SAF-33** — `knowledge-retrieval` MCP server (ADR-0004) — alongside the first agent that needs semantic search.
- **SAF-34–37** — Project Digital Twin implementation (ADR-0021) — once Governance/Project aggregates exist to project from.
- **SAF-38** — `context-notification` (new at this baseline) — before any Sprint 1/2 story needs to actually send a notification.

---

## Current Limitations

Stated explicitly, not left implicit:

- No real SAP/BTP/LLM/MCP integrations exist — every LLM/MCP adapter uses mocked responses; no real Fiori/CAP/RAP/ABAP generation logic exists anywhere.
- A real Authorization Code cannot be obtained without a browser this environment lacks — every "authenticate" demonstration uses Keycloak's Direct Grant, explicitly test-only, never used by production code.
- Only two of ten bounded contexts have real persistence (`identity`, `governance`) — the rest are domain-modeled, in-memory only.
- The platform runs as exactly one replica per app, always — no resilience/circuit-breaker state is shared, because nothing yet requires more than one replica.
- No production deployment pipeline exists — `deploy-dev` in `ci.yml` is a stated placeholder.
- No SAST (CodeQL) is wired — GitHub Advanced Security licensing on this repository is undecided.
- CI has never executed on a real GitHub Actions runner — verified locally only, pending push authorization.

---

## Planning Strategy

Beginning with Sprint 1, the platform evolves using **Vertical Slices**, not horizontal layers built ahead of demand — see [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md)'s Engineering Planning Principles for the full rule set. Every sprint must finish with:

- A working, user-visible capability — not partial plumbing.
- Tests — unit coverage for new domain logic, contract tests for any new/changed port-adapter pair, and end-to-end proof the slice works as a whole.
- Documentation — package READMEs, architecture doc updates, and an ADR for any cross-cutting decision.
- A Digital Twin update — once [context-digital-twin](docs/architecture/16-project-digital-twin.md) exists (SAF-34–37); until then, satisfied by existing traceability mechanisms (audit events, backlog entries).
- Capability registration — no workflow invokes an unregistered, ad hoc implementation.
- A Sprint Exit Gate — the same discipline this baseline's own [Exit Gate](docs/governance/sprint-0-exit-gate/README.md) established, scaled to one sprint's scope; see [PROJECT_PLAYBOOK.md](PROJECT_PLAYBOOK.md) for the step-by-step process.

Architecture evolves only through approved ADRs — never ad hoc redesign, however well-intentioned or however familiar the person proposing it is with the codebase. See [ARCHITECTURE_FREEZE.md](ARCHITECTURE_FREEZE.md) for the exact governance sequence (ADR → impact analysis → architecture review → approval) every architectural change now requires.

For what each upcoming sprint actually aims to deliver, see [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md)'s Official Roadmap and [ROADMAP.md](ROADMAP.md).

## Architecture Checksum

The authoritative reference set for every future architecture review — nothing outside this list should be treated as an architectural decision:

1. [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md)
2. [ARCHITECTURE_PRINCIPLES.md](ARCHITECTURE_PRINCIPLES.md)
3. [CODING_STANDARDS.md](CODING_STANDARDS.md)
4. [SECURITY_BASELINE.md](SECURITY_BASELINE.md)
5. [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md)
6. [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)
7. [DEFINITION_OF_READY.md](DEFINITION_OF_READY.md)
8. [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md)
9. [CONTRIBUTING.md](CONTRIBUTING.md)
10. [ADR_TEMPLATE.md](ADR_TEMPLATE.md)
11. All 23 files under [docs/adr/](docs/adr/) — index: [ARCHITECTURE_DECISION_INDEX.md](ARCHITECTURE_DECISION_INDEX.md) *(was 22 at the Sprint 0 baseline; ADR-0023 added 2026-07-15, corrected here at Sprint 1's closure — see the Sprint 1 Baseline Validation notes)*
12. All 20 files under [docs/architecture/](docs/architecture/) (`00` through `19`) *(was 19/`00`–`18` at the Sprint 0 baseline; `19-platform-kernel-and-platform-packs.md` added 2026-07-15, corrected here at Sprint 1's closure)*
13. [docs/backlog/sprint-0-backlog.md](docs/backlog/sprint-0-backlog.md) and [docs/backlog/sprint-1-backlog.md](docs/backlog/sprint-1-backlog.md)
14. [.ai/README.md](.ai/README.md) and its templates
15. All 17 files under [docs/governance/sprint-0-exit-gate/](docs/governance/sprint-0-exit-gate/README.md), and all files under [docs/governance/sprint-1-product-design-review/](docs/governance/sprint-1-product-design-review/README.md) and [docs/execution/sprint-1/](docs/execution/sprint-1/README.md)
16. This document, [ARCHITECTURE_DECISION_INDEX.md](ARCHITECTURE_DECISION_INDEX.md), [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md), and [ARCHITECTURE_FREEZE.md](ARCHITECTURE_FREEZE.md)
17. [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md), [ROADMAP.md](ROADMAP.md), [PROJECT_PLAYBOOK.md](PROJECT_PLAYBOOK.md), and [SESSION_STARTUP_POLICY.md](SESSION_STARTUP_POLICY.md) — added at the Sprint 0 → Sprint 1 governance transition; see [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) for how they relate to one another
18. [CHANGELOG.md](CHANGELOG.md), [CONTINUOUS_IMPROVEMENT_BACKLOG.md](CONTINUOUS_IMPROVEMENT_BACKLOG.md), and [ENGINEERING_DECISION_LOG.md](ENGINEERING_DECISION_LOG.md) — added at Sprint 1's closure (the VS-1 Engineering Retrospective); living documents every future Vertical Slice/sprint close adds to, never recreated

Any document not in this list that appears to describe an architectural decision is either draft material or an error — raise it for correction rather than treating it as authoritative.

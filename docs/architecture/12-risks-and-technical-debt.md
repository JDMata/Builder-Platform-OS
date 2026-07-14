# 12 — Risks & Technical Debt Prevention

## Risk register

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R1 | SAP-specific logic leaks into core ("just one `if (artifactType === 'fiori')`") | High — undoes the entire plugin architecture over time | High (default path of least resistance under deadline pressure) | Banned-keyword CI guard + dependency-cruiser rule forbidding `plugins/*` imports outside `apps/*` (see below) |
| R2 | Workflow engine choice (in-house vs. Temporal) made emotionally instead of by evidence | High — this is the platform's core differentiator | Medium | Port-first design ([07](07-workflow-engine.md)); revisit via ADR once real workflow complexity is observed, not before |
| R3 | Plugin execution isolation stays "just a function call" indefinitely, becoming a security boundary in name only | Medium-High — third-party/partner plugins eventually run with too much ambient trust | Medium | Scoped capability tokens from Sprint 0 even while isolation is in-process ([05](05-plugin-architecture.md)); process/container isolation is a tracked backlog item, not an afterthought |
| R4 | Multi-LLM cost governance is an afterthought, leading to runaway spend once agents fan out | Medium | Medium-High | `CostBudget` aggregate and `UsageRecord` exist in the domain model from Sprint 0 ([02](02-domain-model.md)), even before enforcement logic ships |
| R5 | Premature microservice extraction reintroduces distributed-systems tax with no payoff | Medium | Medium | Modular-monolith-first ADR ([ADR-0003](../adr/0003-modular-monolith-first.md)) with explicit extraction criteria ([04](04-service-boundaries.md)) |
| R6 | Team skill gaps in OPA/Cedar policy-as-code or (if later adopted) Temporal slow delivery | Medium | Medium | Start with the simplest adapter that satisfies the port; invest in team ramp-up before, not during, the sprint that needs it |
| R7 | Event schema versioning discipline erodes ("just change the field, it's fine") | Medium | Medium | `dataVersion` + `.vN` in event type strings from day one ([06](06-event-model.md)); schema changes reviewed like API changes |
| R8 | Vendor lock-in creeps in through "convenience" SDK calls inside application code | High (long-term) | Medium | Adapter-only third-party SDK imports enforced by dependency-cruiser; contract tests per port |
| R9 | Scope creep during Sprint 0 — building a feature "while we're in there" | Medium | High | Explicit non-goals list ([00](00-vision-and-principles.md)); backlog captures the idea for a later sprint instead |
| R10 | Governance/audit trail is bolted on later instead of structural | High (compliance/PMO risk) | Medium if not addressed now | `AuditEvent` derivation from the event bus is part of the Sprint 0 domain model, not a future integration |

### Added by principal-architect self-review ([13-principal-architect-self-review.md](13-principal-architect-self-review.md))

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R11 | Single pooled Postgres instance is a cross-tenant blast radius and noisy-neighbor point at 500+ projects | High | High without mitigation | Partitioning + HA ([ADR-0009 revision](../adr/0009-postgresql-schema-per-context-drizzle.md)); Silo/Dedicated tiers for tenants that need to move off the shared instance ([ADR-0013](../adr/0013-tenancy-isolation-tiering.md)) |
| R12 | Per-replica circuit-breaker/rate-limit state gives inconsistent failure handling once `orchestrator`/`worker` scale to multiple replicas | Medium-High | High at target scale (multi-replica is required, not optional) | Shared Redis-backed resilience state ([ADR-0016](../adr/0016-mandatory-resilience-patterns.md)) |
| R13 | Target-system credentials (privileged access to customer SAP landscapes) were at risk of being treated as generic secrets, under-investing in the controls this specific blast radius needs | High | Medium | Dedicated Connection Management capability with envelope encryption, BYOK, and just-in-time issuance ([ADR-0015](../adr/0015-target-system-credential-management.md)) |
| R14 | Append-only audit trail structurally conflicts with GDPR/CCPA erasure once real PII is stored | High (compliance) | High at first EU/regulated enterprise customer | Per-subject PII vault + crypto-shredding ([ADR-0017](../adr/0017-data-retention-crypto-shredding.md)) |
| R15 | Unbounded growth of `audit_event`/`agent_invocation`/`workflow_step` with no partitioning plan forces an emergency migration on a live, multi-billion-row table later | High | High if unaddressed before production volume arrives | Time-based partitioning from the first migration ([ADR-0009 revision](../adr/0009-postgresql-schema-per-context-drizzle.md)) |
| R16 | In-house workflow engine underestimates the difficulty of durable execution at hundreds-of-workflows scale (crash recovery, replay, signal delivery, definition versioning under live runs) | High | Medium-High if built without a proven-engine comparison | Timeboxed Temporal/equivalent spike in Sprint 1, decision made on real data rather than deferred indefinitely ([ADR-0008 revision](../adr/0008-workflow-engine-in-house-first.md)) |
| R17 | Plugin execution isolation deferred past the point real generator plugins run untrusted input in a multi-tenant process | High | High once any real plugin ships | Process/container isolation elevated to a hard prerequisite for the first real plugin, not just third-party ones ([ADR-0006 revision](../adr/0006-plugin-architecture.md)) |
| R18 | No dynamic, per-tenant feature-flag mechanism despite "everything configurable" being a stated principle — static env config alone can't support tier-gated capabilities or gradual plugin-version rollout | Medium | Medium, growing as the tenant base diversifies | Tracked gap, not yet a full ADR — revisit once the first tier-gated feature is scoped (see [13-principal-architect-self-review.md](13-principal-architect-self-review.md) §9) |

### Added with execution profiles for generated applications ([ADR-0019](../adr/0019-execution-profiles-for-generated-applications.md), [14-execution-profiles.md](14-execution-profiles.md))

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R19 | Mock and Enterprise-tier adapters for the same generated-application port behave differently ("works in Local POC, fails in Enterprise") | High (undermines the platform's core demo-to-production promise) | High without mitigation — this is the default failure mode of any mock/real split | Shared contract-test suite per port in `generated-app-kit`, run against both the mock and real adapter, extending the same discipline already used for the platform's own ports |
| R20 | Application-generating plugins each reimplement their own mock persistence/auth/SAP-API adapters, duplicating maintenance and drifting independently | Medium-High | High if not centralized from the first application-generating plugin | `packages/generated-app-kit` is the single shared, versioned adapter library every such plugin depends on, never reimplements |
| R21 | Contract-testing Enterprise-tier adapters (real HANA Cloud, XSUAA, Destination Service) on every CI run is slow and requires live BTP entitlements | Medium | Medium | Reuse the platform's existing fast-PR/slow-nightly CI cadence pattern: mock-adapter contract tests on every PR, Enterprise-adapter contract tests against sandboxed BTP resources on a slower cadence |

## Technical debt prevention strategy: architecture fitness functions

Principles are only as strong as their enforcement. Every principle in [00-vision-and-principles.md](00-vision-and-principles.md) maps to a mechanical, CI-failing check — a "fitness function" — so violations are caught before merge, not during a future audit:

| Principle | Fitness function | Where |
|---|---|---|
| No SAP logic in core | Grep-based CI guard scanning `domain/*`, `application/*`, `apps/*` (excluding `plugins/*`) for a banned keyword list (`fiori`, `sapui5`, `abap`, `rap`, `cds`, `odata`, `btp`, `cloudfoundry`, `kyma` — case-insensitive, allowlist for comments referencing this doc) | CI stage "Architecture fitness checks" |
| Hexagonal layering | `dependency-cruiser.config.cjs` encodes the layer rules from [01](01-high-level-architecture.md)/[03](03-monorepo-and-packages.md) | CI "Lint" stage |
| Plugin isolation boundary | dependency-cruiser rule: only `apps/orchestrator`/`apps/worker` may depend on `plugins/*`, and only via `plugin-sdk`'s loader type, never a named plugin import | CI "Lint" stage |
| Port/adapter swappability | Shared contract test suites in `testing-kit`, required for every adapter | CI "Contract test" stage |
| Vendor neutrality | dependency-cruiser rule: third-party SDK packages (LLM/MCP/cloud SDKs) may only appear in `*-adapters/*` package.json files | CI "Lint" stage |
| Documentation-as-code | CI check: every package under `packages/`/`plugins/`/`apps/` must have a README with a "Purpose" and "Ports" section | CI "Architecture fitness checks" |
| Test coverage floors | Vitest coverage thresholds per layer ([10](10-coding-standards-and-naming.md)) | CI "Unit test" stage |
| ADR required for cross-cutting decisions | PR template checklist item + lightweight PR label `needs-adr`; reviewers block merge if a structural decision has no linked ADR | PR review, not automatable in Sprint 0 |
| Tenant isolation (added post-review, R11) | Automated test suite that attempts a cross-tenant read through every repository (varying `RequestContext.tenantId` against fixed data) and asserts it fails, independent of whether RLS is also correctly configured | CI "Contract test" stage |
| Resilience envelope applied to every adapter call (added post-review, R12) | Static check that every `llm-adapters/*`/`mcp-adapters/*` module routes through the shared `llm-core`/`mcp-core` resilience wrapper rather than calling its SDK client directly | CI "Lint" stage (dependency-cruiser + a targeted ESLint rule) |
| No hard deletes on cross-context-referenced aggregates (added post-review) | Schema lint checking that tables backing such aggregates have a status/archived column and no unguarded `DELETE` path in the repository layer | CI "Architecture fitness checks" |
| Partitioned high-volume tables (added post-review, R15) | Migration lint verifying `audit_event`, `agent_invocation`, and `workflow_step` migrations declare partitioning before any non-partitioned variant can merge | CI "Architecture fitness checks" |
| Generated-app port parity (added with execution profiles, R19) | Shared contract-test suite in `generated-app-kit`, required to pass for both the mock and Enterprise adapter of every one of the seven ports before either can merge | CI "Contract test" stage |
| No duplicated generated-app adapters (added with execution profiles, R20) | Dependency check on application-generating plugins verifying they import `generated-app-kit`'s adapters rather than defining their own mock persistence/auth/SAP-API implementations | CI "Architecture fitness checks" |

## Cadence

- **ADR review**: any Proposed ADR blocks related implementation work until Accepted (see [docs/adr/README.md](../adr/README.md)).
- **Quarterly architecture review**: revisit the risk register above, retire mitigated risks, and re-evaluate the two decisions explicitly flagged as provisional (workflow engine adapter choice, plugin isolation model) against real usage data.
- **Any violation of a fitness function is a build failure, not a warning** — a failing check that can be silenced by a config flag inevitably gets silenced under deadline pressure; these checks are wired to fail the pipeline outright.

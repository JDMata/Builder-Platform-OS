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

### Added with the `.ai/` AI Workspace ([ADR-0020](../adr/0020-ai-workspace-for-agent-definitions.md), [15-ai-workspace.md](15-ai-workspace.md))

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R22 | An agent's "Memory" becomes an ungoverned shadow data store (a private cache/vector store/file an agent alone reads and writes) | High | High without an explicit rule — this is the default failure mode of ad hoc agent memory | Memory is scoped and persisted only through the existing `Repository<T>` port and `RequestContext`, subject to the same tenant isolation and retention/crypto-shredding rules as all other project data — stated as a hard rule in `.ai/README.md`, not left to convention |
| R23 | Boilerplate (escalation rules, tool-permission scopes, prompt preambles) is copy-pasted and independently drifts across "dozens of specialized agents" | Medium-High | High without shared structure | `.ai/templates/*`, `.ai/prompts/_shared/*`, and policy-by-reference (never restated) — the same "factor it once" pattern already applied to `generated-app-kit` and the LLM/MCP resilience wrapper |
| R24 | `.ai/` content is reviewed less rigorously than code because it "looks like configuration," despite changing production agent behavior just as materially | Medium | Medium | Stated explicitly as a ground rule in `.ai/README.md`: same PR review discipline as `CODING_STANDARDS.md`, no exemption |
| R25 | Indirect prompt injection via `knowledge/` content that was ever adapted from an external source | Medium | Medium | Retrieved knowledge is treated as untrusted input at the point it re-enters an agent's context, reusing the existing input-validation-at-boundary rule rather than a new mechanism; combined with the existing rule that any tool call touching a credential/target system/egress requires approval regardless of an agent's own declared permissions |

### Added with the Project Digital Twin ([ADR-0021](../adr/0021-project-digital-twin-knowledge-graph.md), [16-project-digital-twin.md](16-project-digital-twin.md))

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R26 | The Digital Twin becomes a second source of truth that drifts from the aggregates it represents | High | High without an explicit rule — the default failure mode of any graph/projection layer | Nodes store only a `sourceRef` + minimal display fields; populated exclusively by projecting domain events, never written to directly — identical discipline to `read-models` ([ADR-0014](../adr/0014-cqrs-read-models.md)) |
| R27 | Relationship-type sprawl — dozens of agents proposing near-duplicate ad hoc relationship strings (`"implements"`, `"implements-partially"`, ...) | Medium-High | High without registration | `RelationshipTypeDefinition`/`NodeTypeDefinition` registries, CI-checked before use — the third application of the opaque-registered-type pattern already used for `ArtifactType` and `PortCategory` |
| R28 | AI-inferred relationships treated as ground truth, silently corrupting impact analysis or traceability-completeness checks | High | Medium-High if not enforced | Mandatory `provenance`/confidence tagging; inferred edges never count as ground truth until confirmed via `ReviewGate` |
| R29 | Graph query performance degrades at 500+ projects over a 10-year archive | Medium | Medium | `GraphStorePort` keeps a dedicated graph engine available as an adapter swap; partitioning/archival discipline already established for other high-volume tables applies to node/edge history; queries are project-scoped by default, never cross-project |
| R30 | Cross-project similarity search (future AI reasoning) accidentally leaks across tenants | High | Low if the existing rule is followed, High if it's forgotten | Explicitly scoped to `RequestContext`/tenant isolation, no exception, stated directly in the design doc rather than left implicit |

### Added with the Capability Model ([ADR-0022](../adr/0022-capability-model-provider-abstraction.md), [18-capability-model.md](18-capability-model.md))

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R31 | A `Capability` is registered with zero eligible `CapabilityProvider`s, becoming a dead end the first time a workflow requests it | Medium-High | Medium without a check | Fitness function requiring at least one registered provider before a `Capability` can be referenced by a `WorkflowDefinition` — the same "no orphan reference" discipline already applied elsewhere |
| R32 | `CapabilityProvider` (this decision) confused with the pre-existing `CapabilityBinding` (MCP Registry — tool-access authorization) — both names contain "Capability" and describe different things | Low-Medium | Medium, given how similar the names read | Documented explicitly, side by side, in [18-capability-model.md](18-capability-model.md) rather than left for someone to rediscover as confusion |
| R33 | Escalation/approval logic duplicated per `CapabilityProvider` instead of centralized on the `Capability`, letting the "same" business rule drift between an agent's own fields and a plugin's `ReviewGate` usage | Medium | Medium if not stated as the default | Stated as the intended default in [18-capability-model.md](18-capability-model.md) and [15-ai-workspace.md](15-ai-workspace.md) — governance moves to the `Capability` level over time, not duplicated per provider |

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
| `.ai/` content schema and safety (added with AI Workspace, R22/R24/R25) | Planned (Sprint 1/2, not yet active — see backlog): CI validation that every `agent.md`/`prompt.md`/`policy.md`/`workflow.md` matches its template's required fields, and a banned-content scan for secrets or customer-identifying data under `.ai/knowledge/` | CI "Architecture fitness checks" (once the loader exists) |
| Digital Twin node/edge type registration (added with Digital Twin, R27) | Planned (Sprint 1/2, not yet active — see backlog): CI check that every `nodeType`/`relationshipType` used anywhere is present in the `NodeTypeDefinition`/`RelationshipTypeDefinition` registry before merge | CI "Architecture fitness checks" (once the loader exists) |
| No unreviewed AI-inferred edges as ground truth (added with Digital Twin, R28) | Planned: query-layer check that any traceability-completeness or impact-analysis read filters out `provenance: 'ai-inferred'` edges unless explicitly confirmed | CI "Contract test" stage (once the graph store adapter exists) |
| No orphan capabilities (added with the Capability Model, R31) | Planned (once `WorkflowDefinition`/`Capability` are implemented, not yet built): a `WorkflowDefinition` referencing a `Capability` with zero registered `CapabilityProvider`s fails validation before the definition can be published | CI "Architecture fitness checks" (once implemented) |

## Cadence

- **ADR review**: any Proposed ADR blocks related implementation work until Accepted (see [docs/adr/README.md](../adr/README.md)).
- **Quarterly architecture review**: revisit the risk register above, retire mitigated risks, and re-evaluate the two decisions explicitly flagged as provisional (workflow engine adapter choice, plugin isolation model) against real usage data.
- **Any violation of a fitness function is a build failure, not a warning** — a failing check that can be silenced by a config flag inevitably gets silenced under deadline pressure; these checks are wired to fail the pipeline outright.

# 13 — Principal Architect Self-Review (Sprint 0 Architecture, Re-Examined at Target Scale)

This document is an adversarial review of every decision in [00](00-vision-and-principles.md)–[12](12-risks-and-technical-debt.md) and [docs/adr/](../adr/), performed against the platform's actual 10-year target, not its Sprint 0 footprint:

> **500+ projects · dozens of MCP servers · hundreds of workflow definitions · multiple AI providers · enterprise customers · SaaS multi-tenancy**

A rough order-of-magnitude check justifies treating this as a distinct design pass rather than a formality: 500 projects × ~5 workflow definitions each is consistent with "hundreds of workflows," and even a conservative 50 runs/project/year × 20 steps/run × 2 agent invocations/step is ~1M `agent_invocation` rows/year — before accounting for growth, meaning tens to hundreds of millions of rows in the busiest tables within the platform's own stated 10-year horizon. Several Sprint 0 decisions were sized for "does this work at all," not for that number. This review is organized by the requested lenses. Each finding states severity, the concrete failure mode, and the document/ADR it changes. **Nothing here is a rewrite of Sprint 0's principles** ([00](00-vision-and-principles.md)) — hexagonal layering, ports-before-adapters, and plugin isolation all hold up under scale and are reinforced, not abandoned, below.

---

## 1. Scalability risks

### 1.1 Single Postgres instance per environment is a scale and blast-radius risk (High)
[09-database-proposal.md](09-database-proposal.md) put every bounded context's schema in one physical instance per environment. At target scale this instance carries: OLTP traffic for 500+ projects, hundreds of workflow definitions' execution state, and the fastest-growing tables in the system (`workflow_step`, `agent_invocation`, `audit_event`) with no partitioning or archival plan. Consequences: (a) one giant enterprise tenant's query load degrades every other tenant sharing the instance — noisy neighbor at the database tier, not just the application tier; (b) a failover, major-version upgrade, or connection-pool exhaustion event takes down all tenants simultaneously; (c) unbounded table growth in `audit_event`/`agent_invocation` eventually degrades autovacuum and index performance for everyone.
**Change:** [ADR-0009 revision](../adr/0009-postgresql-schema-per-context-drizzle.md) adds mandatory time-based partitioning for high-volume tables and an HA/read-replica requirement. [ADR-0013 (new)](../adr/0013-tenancy-isolation-tiering.md) introduces tenant isolation tiers so large/regulated tenants can be moved off the shared instance entirely.

### 1.2 In-process LLM/MCP client state doesn't survive horizontal scale-out (High)
[04-service-boundaries.md](04-service-boundaries.md) keeps `llm-core`/`mcp-core` as libraries embedded in `orchestrator`/`worker`. That was the right call for Sprint 0 (no premature service split), but it silently assumed single-instance operation: circuit-breaker state, per-provider rate-limit counters, and MCP server health are currently implied to live in each replica's process memory. With N replicas of `worker` (required at "hundreds of workflows" concurrency), each replica independently rediscovers a failing provider/MCP server, multiplying failed calls during the detection window, and different replicas can make different fallback decisions for the same logical condition.
**Change:** [ADR-0016 (new)](../adr/0016-mandatory-resilience-patterns.md) moves circuit-breaker/rate-limit state to Redis (already in the stack) so it's shared across replicas regardless of whether `llm-core`/`mcp-core` are libraries or services. [04-service-boundaries.md](04-service-boundaries.md) is updated to name LLM Gateway and MCP Registry as the first extraction candidates under [ADR-0003](../adr/0003-modular-monolith-first.md)'s own criteria, with an explicit trigger metric instead of a vague "later."

### 1.3 Worker fleet has no tenant fairness or workload-class separation (Medium-High)
A single BullMQ-backed `worker` queue, as originally described, lets one enterprise tenant's burst of generation jobs (or one runaway plugin) starve every other tenant's jobs — there is no per-tenant weighted fairness or separation between lightweight steps and heavy generation jobs.
**Change:** [04-service-boundaries.md](04-service-boundaries.md) adds a requirement for tenant-aware/priority-aware queue partitioning (separate queues or weighted scheduling per tenant tier, separate queue per workload class) before onboarding tenants with materially different usage volumes.

### 1.4 Workflow engine build-vs-buy was under-weighted for "hundreds of workflows" (Medium-High)
[ADR-0008](../adr/0008-workflow-engine-in-house-first.md) defaulted to an in-house Postgres/BullMQ workflow engine, deferring Temporal until "workflow complexity is empirically known." At the stated target scale, durable execution correctness (crash-safe resumption, exactly-once step advancement, multi-day human-approval signals, safe concurrent fan-out, definition versioning for in-flight runs) is not a nice-to-have — it is the platform's core reliability property, and getting it wrong is exactly the kind of subtle distributed-systems bug that is expensive to fix after hundreds of workflow definitions depend on it.
**Change:** see §6.2 and the revision in [ADR-0008](../adr/0008-workflow-engine-in-house-first.md) — the default bias shifts toward spiking a proven durable-execution engine early rather than treating it as a later option.

---

## 2. Security risks

### 2.1 Tenant isolation relies on a single "don't forget to set it" connection setting (High)
Row-Level Security keyed on `current_setting('app.tenant_id')` ([09-database-proposal.md](09-database-proposal.md)) is a good control, but it is the *only* control — one code path that opens a connection without setting the session variable is a cross-tenant data leak, and RLS misconfiguration bugs are historically common.
**Change:** [02-domain-model.md](02-domain-model.md) adds an explicit `RequestContext`/`TenantContext` type threaded through every port call (defense-in-depth at the application layer, independent of the database layer), and [12-risks-and-technical-debt.md](12-risks-and-technical-debt.md) adds a mandatory fitness function: an automated test suite that attempts cross-tenant reads through every repository and asserts they fail, run in CI, not just at RLS-policy-authoring time.

### 2.2 Target-system credentials (customer SAP BTP/CF/Kyma/on-prem access) had no dedicated security model (High — missing, not just weak)
Sprint 0's `ports/secrets-vault.port.ts` was written as a generic secret store for the platform's *own* credentials (IdP client secret, LLM/MCP keys). It was silently reused in intent for a much higher-stakes case: credentials the platform holds to deploy generated artifacts into a customer's production SAP landscape. That is privileged access into regulated enterprise systems and deserves its own threat model, not a shared generic vault entry.
**Change:** [ADR-0015 (new)](../adr/0015-target-system-credential-management.md) introduces a dedicated Connection Management capability with envelope encryption, optional customer-managed keys (BYOK) for the dedicated tenancy tier, just-in-time short-lived credential issuance (never cached beyond a single deployment operation), and mandatory audit logging of every use, tied to the RBAC model via a new `connection:use` permission distinct from `connection:manage`.

### 2.3 No explicit control for prompt injection → unauthorized tool invocation (Medium-High)
MCP capability bindings ([ADR-0004](../adr/0004-mcp-abstraction-layer.md)) scope *which* tools a plugin/step may call, but nothing in the original design addresses an agent being manipulated (via injected content in a requirement document, a retrieved artifact, or MCP tool output) into calling an *allowed* tool for a harmful purpose — e.g., exfiltrating data through a legitimately-bound notification or integration tool.
**Change:** [08-authentication-and-rbac.md](08-authentication-and-rbac.md) adds a control: any tool call that touches a target system, a credential, or leaves the tenant boundary (egress) requires either a pre-approved allow-list per workflow step (not just per plugin) or a human `ReviewGate`, regardless of whether the calling plugin's manifest technically permits it. This is a policy-as-code addition (extends [ADR-0011](../adr/0011-hybrid-rbac-abac-policy-as-code.md)), not new infrastructure.

### 2.4 Plugin isolation was deferred past the point it's actually needed (High)
[ADR-0006](../adr/0006-plugin-architecture.md) accepted in-process plugin execution for Sprint 0 "since no plugin has real logic yet" and treated stronger isolation as a future backlog item. At target scale, real generator plugins execute against untrusted input (business requirements text, retrieved SAP metadata) in a genuinely multi-tenant process — a plugin bug or compromised dependency can read another tenant's in-flight data from shared process memory, or exhaust resources for every tenant on that worker.
**Change:** [ADR-0006 revision](../adr/0006-plugin-architecture.md) elevates process/container-level isolation (with CPU/memory/time quotas and no default network egress) from "future risk" to a hard requirement before any plugin with real generation logic ships — not just before *third-party* plugins ship. In-process execution remains acceptable only for the empty Sprint 0 stub plugins.

### 2.5 GDPR/CCPA erasure conflicts structurally with the append-only audit trail (Medium — will become High at first enterprise EU customer)
[02-domain-model.md](02-domain-model.md)'s `AuditEvent` is append-only by design (correct for ITIL/PMO integrity), but nothing addresses what happens when it contains PII and a data-subject erasure request arrives — you cannot delete rows out of an append-only compliance trail without breaking the property that makes it useful as one.
**Change:** [ADR-0017 (new)](../adr/0017-data-retention-crypto-shredding.md) separates PII into a per-subject encrypted vault referenced by opaque ID from audit/event records; erasure = destroying the per-subject key (crypto-shredding), leaving the audit trail's structure and event counts intact.

---

## 3. Maintainability risks

### 3.1 Package-per-layer-per-context is over-fragmented for the team that will actually maintain it (Medium)
[03-monorepo-and-packages.md](03-monorepo-and-packages.md) put `domain/<context>` and `application/<context>` in separate packages for all ten bounded contexts — 20+ packages before counting ports, adapters, plugins, and apps. No context currently needs independent versioning between its domain and application layers; the split adds `package.json`/`tsconfig`/build-graph maintenance overhead with no corresponding benefit yet, which is its own tax on the "can a team five years from now change this without fear" test from [00-vision-and-principles.md](00-vision-and-principles.md).
**Change:** [ADR-0018 (new)](../adr/0018-package-granularity-revision.md) collapses each context's domain+application code into a single package with internal folders, enforcing the layering rule with folder-scoped (not package-scoped) dependency-cruiser rules — same enforced property, roughly half the package count. Split back out the day a context actually needs independent release cadence, per the same extraction-criteria discipline used everywhere else in this architecture.

### 3.2 Workflow/prompt/model versioning wasn't pinned for reproducibility (Medium)
A `WorkflowRun` referencing "the current `WorkflowDefinition`" (rather than a specific version) means editing a workflow definition can silently change the behavior of runs already in flight, and a `PromptTemplate`/`ModelProfile` referenced by logical name without a pinned version means the same workflow can produce different output on Tuesday than it did on Monday with no record of why — a maintainability and audit problem at once (nobody can reproduce or debug a run from six months ago).
**Change:** [02-domain-model.md](02-domain-model.md) adds an explicit rule: every `WorkflowRun` pins the exact `WorkflowDefinition` version, `PromptTemplate` version, and resolved `ModelProfile`→provider/model mapping it used, recorded on the run itself, not derived after the fact from "whatever is current."

### 3.3 Registry cache invalidation across replicas was unaddressed (Medium)
The Capability & Plugin Registry, LLM Gateway `ModelProfile`s, and MCP Registry are read frequently and change rarely — every implementation instinct says "cache them in memory per replica" — but nothing in the original docs specified how a registry change (a plugin update, a model profile edit) propagates to already-running replicas. Left unaddressed, this becomes configuration drift: different replicas serving different registry state simultaneously.
**Change:** [04-service-boundaries.md](04-service-boundaries.md) requires registry-change domain events (already modeled in [06-event-model.md](06-event-model.md)) to double as cache-invalidation signals; every replica's in-memory registry cache subscribes to its own context's change events rather than relying on a fixed TTL alone.

---

## 4. Coupling

### 4.1 Genuinely low, and worth stating explicitly so it isn't accidentally increased later
The no-cross-schema-FK rule, event-only cross-context communication, and the ports/adapters seam all held up under this review — nothing above required loosening a bounded-context boundary. The coupling problems found (§1.2, §3.3) were about **shared runtime state across replicas of the same context** (circuit breakers, caches), not about contexts depending on each other's internals. That distinction matters: the fix is "externalize replica-local state to Redis," not "add a new inter-context dependency."

### 4.2 One coupling gap: cross-context references have no lifecycle contract (Medium)
Contexts reference each other's aggregates by opaque ID (correct), but nothing stops Context A from hard-deleting an aggregate that Context B still references, silently breaking B's referential assumptions with no error — a temporal coupling that only surfaces as a bug much later.
**Change:** [02-domain-model.md](02-domain-model.md) adds an explicit rule: aggregates that may be referenced cross-context are never hard-deleted, only soft-deleted/archived (status transition), so a dangling reference is always resolvable to "archived," never to nothing.

---

## 5. Cohesion

### 5.1 Capability & Plugin Registry and Workflow are appropriately separate, but under-specified at their seam (Low-Medium)
The registry-resolves-capabilities-for-workflow-steps pattern is cohesive in principle, but "resolved at run time" was never pinned down: does a running `WorkflowRun` re-resolve a capability on every step (risking a mid-run capability swap), or resolve once at start? This is the same reproducibility gap as §3.2, restated as a cohesion question: the two contexts agree on *what* they exchange (an ID) but not *when* it's bound.
**Change:** folded into the §3.2 fix — capability resolution, like prompt/model resolution, is pinned at workflow-definition-version scope, not re-resolved per step execution.

### 5.2 Aggregate-per-repository is the wrong cohesion unit for reporting/dashboard use cases (Medium-High)
DDD aggregates are a write-side cohesion unit (consistency boundary); at 500+ projects with hundreds of workflows, the platform's actual UI needs — "show me all failed runs across my tenant this week," "which projects have artifacts awaiting review" — are inherently cross-aggregate and cross-context. Forcing these through aggregate repositories either produces N+1 query fan-out or pressures teams to quietly add cross-context joins that violate the schema-per-context boundary (see [ADR-0009](../adr/0009-postgresql-schema-per-context-drizzle.md)) just to make a dashboard fast.
**Change:** [ADR-0014 (new)](../adr/0014-cqrs-read-models.md) introduces a lightweight CQRS read side — event-fed projections in a dedicated reporting schema, queried directly by `api-gateway`/`web` for list/dashboard/search use cases — so cross-cutting reads have a cohesive home that isn't the write-side aggregate boundary.

---

## 6. Future technical debt

### 6.1 Confirmed and fixed: a real inconsistency in the Sprint 0 docs themselves
[06-event-model.md](06-event-model.md) originally described Sprint 0 event subscribers as "wired in-process," while [04-service-boundaries.md](04-service-boundaries.md) has `orchestrator` and `worker` as *separate deployable processes*. Those two statements can't both be true — an event published by `orchestrator` cannot reach an in-process subscriber living in a different OS process. This was a real design bug hiding in the original plan, not just an omission: it would have surfaced the first time a `worker`-side handler needed to react to an `orchestrator`-side event and silently failed to fire.
**Change:** [06-event-model.md](06-event-model.md) corrected — Postgres LISTEN/NOTIFY (or the relay's polling fallback) *is* the cross-process delivery mechanism; each process runs its own relay/subscriber, not a shared in-memory dispatch. Also see §1.2/§6.3 for why NOTIFY itself won't hold at full scale.

### 6.2 In-house workflow engine as a 10-year maintenance liability (High)
Restating §1.4 from the debt angle: a bespoke durable-execution engine is one of the most common places teams underestimate effort and then live with the consequences for a decade — crash recovery, replay determinism, signal delivery, and definition-versioning-under-live-runs are all individually tricky and interact in ways that produce rare, hard-to-reproduce production bugs. Building it ourselves trades a large one-time adoption cost (Temporal or an equivalent) for an open-ended maintenance and correctness burden that compounds with every new workflow definition.
**Change:** [ADR-0008 revision](../adr/0008-workflow-engine-in-house-first.md) — spike a proven durable-execution engine (Temporal, or a lighter-weight equivalent such as Restate) in Sprint 1, in parallel with hardening the in-house adapter, and make the adoption decision on a fixed timebox rather than an open-ended "when it's empirically justified." The port abstraction ([ADR-0008](../adr/0008-workflow-engine-in-house-first.md) original) is exactly what makes this timebox safe to set — either adapter slots into the same `WorkflowEnginePort`.

### 6.3 Postgres LISTEN/NOTIFY as a long-term event transport (Medium-High)
NOTIFY payloads are capped (~8000 bytes), all notify traffic shares the same instance under load as regular OLTP queries, and slow/disconnected consumers miss notifications entirely (mitigated only by the relay's polling fallback, which itself doesn't scale gracefully to dozens of MCP servers' worth of event volume). This was described as "good enough until a broker is justified," but at target event volume it's a foreseeable bottleneck, not a hypothetical one.
**Change:** [ADR-0007 revision](../adr/0007-event-driven-transactional-outbox.md) brings the Redis Streams adapter forward from "someday" to an explicit Sprint 1-2 milestone (Redis is already a stack dependency, so this is a much smaller lift than adopting Kafka), while keeping the Postgres outbox table itself (the write-side durability guarantee doesn't change — only the fan-out transport does).

### 6.4 No archival/retention plan for the fastest-growing tables (High)
Restating §1.1 from the debt angle: without a retention and archival policy decided now, `audit_event`/`agent_invocation`/`workflow_step` grow unbounded, and retrofitting partitioning onto a live multi-billion-row table under a 24/7 SLA is a materially harder migration than designing it in from the first row.
**Change:** [ADR-0017 (new)](../adr/0017-data-retention-crypto-shredding.md) and the [ADR-0009 revision](../adr/0009-postgresql-schema-per-context-drizzle.md) define per-data-class retention and monthly time-based partitioning from the first migration, so archival is "drop an old partition," not "delete rows in batches against a live table."

---

## 7. Missing enterprise capabilities

Beyond the items already driving ADRs above, this review surfaced capabilities the original plan didn't address at all. Not all are Sprint 0/1 work — they're logged here so they're a deliberate later decision, not a gap nobody noticed:

| Capability | Why it's needed at target scale | Status |
|---|---|---|
| Deployment topology for data residency / on-prem / VPC-isolated delivery | Enterprise SAP customers routinely require this; SaaS-only was an unstated assumption | Addressed now — [ADR-0013](../adr/0013-tenancy-isolation-tiering.md) |
| Billing & metering for the platform itself (distinct from LLM `UsageRecord`) | Needed to run this as a SaaS product at all | Logged, not addressed — new bounded context needed when commercial model is defined |
| Disaster recovery (RPO/RTO targets, backup/restore, cross-region replication) | Single-instance-per-environment had no DR story | Partially addressed — [ADR-0009 revision](../adr/0009-postgresql-schema-per-context-drizzle.md) adds HA/replication as a requirement; explicit RPO/RTO targets are a later ops decision |
| Tenant self-service onboarding/offboarding, including data export | Needed for a real SaaS motion and for enterprise offboarding/portability obligations | Logged, not addressed |
| Support tooling: audited staff impersonation, per-tenant kill-switch | Operating hundreds of tenants without this means support incidents require engineering escalation for routine issues | Logged, not addressed |
| API versioning/deprecation policy | "API First" was stated as a principle with no lifecycle policy behind it | Logged, not addressed |
| Observability cost/retention at scale (trace sampling, backend retention tiers) | Dozens of MCP servers × hundreds of workflows produces trace volume that will make "just export everything" expensive fast | Logged, not addressed |

---

## 8. Unnecessary complexity

### 8.1 Confirmed: package granularity (see §3.1 / ADR-0018)
The clearest case of complexity added ahead of need. Corrected.

### 8.2 Considered and rejected: collapsing schema-per-context into fewer schemas
One could argue ten Postgres schemas is itself premature ceremony. Rejected as a change — unlike the package split (§3.1), the schema boundary is what makes the no-cross-schema-FK rule and later physical extraction (§1.1, [ADR-0013](../adr/0013-tenancy-isolation-tiering.md)) mechanical rather than a rewrite. This is complexity that pays for itself specifically at the target scale this review is evaluating against, so it stays.

### 8.3 Considered and rejected: full event sourcing instead of CQRS-lite
Given the reporting gap in §5.2, a natural over-correction would be adopting full event sourcing (aggregates as pure event streams, no directly-stored current state) across the whole platform. Rejected — that's a much larger investment (event replay performance, snapshotting, schema evolution of the event stream itself as the only source of truth) than the actual problem requires. [ADR-0014](../adr/0014-cqrs-read-models.md) adds read-side projections fed by the events that already exist for integration purposes, while aggregates keep storing current state directly — solves the reporting cohesion problem without taking on event sourcing's much larger maintenance surface.

---

## 9. Missing abstractions

| Missing abstraction | Gap it closes | Introduced via |
|---|---|---|
| `RequestContext` / `TenantContext` (explicit, threaded through every port call) | Tenant-isolation defense-in-depth (§2.1); also carries correlation ID and actor identity for audit, replacing implicit/ambient context | [02-domain-model.md](02-domain-model.md) update |
| `ports/rate-limiter.port.ts` | Rate limiting was only informally mentioned at `api-gateway`; needed as a first-class, swappable, per-tenant/per-provider/per-plugin quota control at target scale | [04-service-boundaries.md](04-service-boundaries.md) update |
| `ports/tenant-connection-resolver.port.ts` | Given a tenant ID, resolve which physical database/schema/region to use — required by tiered tenancy | [ADR-0013](../adr/0013-tenancy-isolation-tiering.md) |
| Read-model / projection layer (`packages/read-models/*`) | Cross-aggregate reporting queries (§5.2) | [ADR-0014](../adr/0014-cqrs-read-models.md) |
| Target System Connection (as a first-class concept, not a generic secret) | Distinguishes ordinary platform secrets from privileged customer-system credentials (§2.2) | [ADR-0015](../adr/0015-target-system-credential-management.md) |
| Resilience envelope (circuit breaker / retry / bulkhead / fallback chain) as a shared helper in `llm-core`/`mcp-core`, not per-adapter | Partial failure is the normal operating condition at dozens of MCP servers / multiple providers, not an edge case (§1.2) | [ADR-0016](../adr/0016-mandatory-resilience-patterns.md) |
| Per-subject PII vault (crypto-shredding key store) | Reconciles append-only audit trail with erasure obligations (§2.5) | [ADR-0017](../adr/0017-data-retention-crypto-shredding.md) |
| Dynamic feature-flag/config port (beyond static typed env config) | "Everything configurable" (principle #16) had no per-tenant, runtime-toggleable mechanism — needed for gradual plugin-version rollout and tier-gated capabilities | Logged in [12-risks-and-technical-debt.md](12-risks-and-technical-debt.md) as a tracked gap, not yet a full ADR — revisit once the first tier-gated feature is scoped |

---

## Summary: what changed vs. what was re-confirmed

**Changed:** database partitioning/HA and tenancy tiering ([ADR-0009](../adr/0009-postgresql-schema-per-context-drizzle.md), [ADR-0013](../adr/0013-tenancy-isolation-tiering.md)); workflow engine adoption bias ([ADR-0008](../adr/0008-workflow-engine-in-house-first.md)); event transport timeline and a corrected cross-process description ([ADR-0007](../adr/0007-event-driven-transactional-outbox.md), [06-event-model.md](06-event-model.md)); plugin isolation timing ([ADR-0006](../adr/0006-plugin-architecture.md)); package granularity ([ADR-0018](../adr/0018-package-granularity-revision.md)); three new capabilities added outright (CQRS read models, target-system credential management, data retention/crypto-shredding).

**Re-confirmed under adversarial review:** hexagonal layering and its mechanical enforcement ([ADR-0002](../adr/0002-hexagonal-clean-layering.md)); modular-monolith-first, refined with named extraction candidates rather than reversed ([ADR-0003](../adr/0003-modular-monolith-first.md)); MCP and LLM abstraction layers as designed ([ADR-0004](../adr/0004-mcp-abstraction-layer.md), [ADR-0005](../adr/0005-llm-abstraction-layer.md)); schema-per-context in Postgres, with additions but no structural change ([ADR-0009](../adr/0009-postgresql-schema-per-context-drizzle.md)); OIDC/Zero Trust auth foundation, extended not replaced ([ADR-0010](../adr/0010-oidc-federation-zero-trust.md)); hybrid RBAC/ABAC, extended with new permission scopes rather than redesigned ([ADR-0011](../adr/0011-hybrid-rbac-abac-policy-as-code.md)); OpenTelemetry as mandatory observability ([ADR-0012](../adr/0012-opentelemetry-mandatory.md)).

The review found one outright bug in the original plan (§6.1, the in-process/cross-process contradiction), one decision under-weighted for stated scale badly enough to flip its default (the workflow engine build-vs-buy bias), and one clear case of adding structure ahead of need (package granularity). Everything else is an addition or a refinement, not a reversal — which is itself a useful signal: the layering, port, and event-driven foundations were sized correctly for a 10-year horizon; the gaps were concentrated in cross-cutting operational concerns (data volume, replica-shared state, tenancy, and privileged credentials) that Sprint 0's "prove the seams exist" scope hadn't yet been asked to consider.

## Addendum (2026-07-14): execution profiles for generated applications

A later architectural extension — [ADR-0019](../adr/0019-execution-profiles-for-generated-applications.md), designing Local POC / Hybrid / Enterprise execution profiles for *generated* applications — received its own scoped self-review rather than being folded into the analysis above, since it concerns the platform's output architecture, not the platform-scale concerns (500+ projects, dozens of MCP servers, tenancy, data volume) this document was written against. See [14-execution-profiles.md](14-execution-profiles.md) §6 for that review. Headline finding: the capability reuses three already-established patterns (ports & adapters, shared contract testing, `TargetSystemConnection` credential resolution) rather than inventing new ones, and was scoped down once (a fourth "hybrid" mechanism was proposed and rejected in favor of per-port composability) before being accepted.

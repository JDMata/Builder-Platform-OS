# Engineering Execution Strategy — Sprint 5 and Beyond

**Board:** Builder Platform OS Engineering Leadership Board.
**Status:** Operational reference material — the formal handoff from Architecture (frozen, validated by [Gate C](gate-c-executable-architecture-validation.md)) to Engineering. Not constitutional; revised as execution reality demands, unlike AF/PXF/ECS/XLS.
**Discipline this document follows throughout:** where [PROJECT_PLAYBOOK.md](../../PROJECT_PLAYBOOK.md), [TECHNICAL_DEBT_POLICY.md](../../TECHNICAL_DEBT_POLICY.md), [ENGINEERING_PRINCIPLES.md](../../ENGINEERING_PRINCIPLES.md), or `CODEOWNERS` already answer a question this brief asks, this document cites them rather than restating them. The prior Repository Structure Review found duplicate ownership of the same content to be this repository's most significant defect (`ENGINEERING_PRINCIPLES.md` vs. AF's own principles) — this document is written not to repeat that mistake.

---

## Part 1 — Engineering Organization

Team boundaries are derived directly from [06-canonical-machine-model.md](../product/06-canonical-machine-model.md) (CMM) §10's own Implementation Mapping table — not invented fresh. `CODEOWNERS` already scaffolds path-based ownership for a growing team ("every path currently resolves to the same single owner... adding a second owner later is a one-line change per area, not a restructure") — these teams are the areas that scaffold already anticipates.

| Team | Owns | Maps to | Why |
|---|---|---|---|
| **Core Platform Team** | `packages/ports/`, `packages/http-server-kit`, `packages/observability`, `packages/resilience-kit`, `apps/api-gateway`, `apps/orchestrator`, `apps/worker` (composition roots) | CMM §10's cross-cutting seams | Already the highest-scrutiny `CODEOWNERS` tier ("a change here affects every consumer") |
| **AI Team** | `.ai/`, `llm-adapters`, `llm-core`, `context-llm-gateway`, `AgentDefinition` lifecycle | CMM's "AI Agents" implementation surface | Already its own `CODEOWNERS` entry, "reviewed with the same rigor as code" |
| **Engineering Canvas Team** | The ECS implementation — Canvas view, the four synchronized views, Inspector | CMM's "Engineering Canvas" implementation surface | ECS is a single, coherent constitutional document; one team keeps its implementation coherent too |
| **Registry Team** | `context-capability-registry`, `capability-registry-adapters`, future `context-digital-twin` graph-store adapter, `NodeTypeDefinition`/`RelationshipTypeDefinition` | CMM's "Registry Engine" | This is the platform's critical path (Part 3) — deserves a dedicated, focused team, not a shared one |
| **Workflow Team** | `context-workflow`, `workflow-engine-adapters`, `WorkflowRun`/`Step`/`WorkflowDefinition` | CMM's "Workflow Runtime" | `WorkflowEnginePort` is already an isolated seam ([ADR-0008](../adr/0008-workflow-engine-in-house-first.md)) |
| **Delivery Team** | The new Repository Provider port (Part 6) and coordination with existing Deployment Providers | CMM's "Delivery Runtime" | New team scope, because this is Gate C's one open gap — this team's first sprint objective *is* closing it |
| **Platform Pack Team** | `plugins/`, `plugin-sdk` | Already its own `CODEOWNERS` entry ("the primary extension point... eventually authored by people who aren't core-platform maintainers") | Matches doc19's Platform Pack model exactly |
| **UX Team** | `apps/web`, the PXF/XLS implementation (design tokens, shared component set once built) | PXF §22, XLS §37 (Frontend Engineering Standards / React Derivation Rules) | The one team whose "constitutional documents" (PXF, XLS) are not yet reflected in `CODEOWNERS` at all — carried forward from the prior Repository Review's Critical finding #2, not resolved here (out of scope for a strategy document; the fix is a one-line `CODEOWNERS` edit, already recommended once) |

**Ownership boundaries are Ports & Adapters boundaries, not org-chart boundaries** — a team owns the port and its adapters; no team owns "a feature" that spans multiple ports, which is exactly the discipline AF's Hexagonal Architecture principle (#4) already enforces at the code level, applied here to people.

---

## Part 2 — Implementation Streams

| Stream | Independent from Sprint 5? | Synchronization point |
|---|---|---|
| Graph Runtime (`GraphStorePort`, `graph-adapters/postgres-age`) | **Yes** | Unblocks Architecture & Design (CAP-002) and all three cross-cutting AI capabilities (CAP-012–014) once complete |
| Workflow Runtime | **Yes — already has a real skeleton** ([07-workflow-engine.md](../architecture/07-workflow-engine.md)) | Needed by every stream that executes a `Capability` via a `WorkflowRun` |
| Registry Runtime (`CapabilityResolverPort`) | **No new work needed to start** — already real, shipped code (per CMM's own identity-model evidence) | Every downstream capability (Documentation, Development, Testing) depends on this being real, and it already is |
| Delivery Runtime (Repository Provider port) | **Yes** | Only becomes load-bearing once Development-phase generation (CAP-007–010) produces something to publish |
| Search | **Yes**, but low priority — depends on Graph Runtime for structured search, is independent for full-text search | Needed before semantic search rollout (Requirements/Incidents, per [16-project-digital-twin.md §7](../architecture/16-project-digital-twin.md)) |
| AI Runtime (`LlmProviderPort`, `AgentDefinition`) | **No new work needed to start** — already real (Sprint 1) | Every `CapabilityProvider` with `providerType: agent` depends on this |
| Platform Packs | **Yes, foundation work** (SAF-25 plugin isolation) **can start immediately**; the first real pack depends on Registry Runtime and Delivery Runtime both existing | First real Fiori Generator Pack is the convergence point of three streams |
| Authentication | **Already substantially complete** (OIDC/Zero Trust, ADR-0010, real since Sprint 1) | Not a blocker for anything — the furthest-along stream |
| Administration (Platform Operator persona's tooling) | **Yes, but low priority** | PXF §4 already discloses this persona's tooling "is not yet built" — no urgency until Operations-stage capabilities (CAP-012–014) are real |

**Four streams can proceed in true parallel from Sprint 5 with zero shared dependency**: Graph Runtime, Delivery Runtime, Platform Pack foundation (SAF-25), and Documentation Factory (which needs nothing new — Registry and AI Runtime are already real).

---

## Part 3 — Engineering Dependency Graph

```
Registry Runtime (real today) ──────────────► Documentation Factory (CAP-003/004) ─┐
                                                                                     │
Graph Runtime (graph-adapters/postgres-age) ─► Architecture & Design (CAP-002)      │
                                            └─► Impact Analysis / Gap Detection /    │
                                                 Root-Cause Assistance (CAP-012–014) │
                                                                                     ▼
SAF-25 (plugin isolation) ──────────────────► Platform Pack foundation ──► Development-phase
                                                                            generation (CAP-007–010)
                                                                                     │
Delivery Runtime (Repository Provider port) ────────────────────────────────────────┤
                                                                                     ▼
                                                                    Testing generation (CAP-011)
                                                                                     ▼
                                                                    A complete, real, end-to-end run
                                                                    of Gate C's own worked example
```

**Foundational (nothing downstream works without them, already real):** Registry Runtime, AI Runtime, Authentication.
**Foundational (nothing downstream works without them, not yet real):** Graph Runtime.
**Can be postponed without blocking near-term value:** Search, Administration tooling, Delivery Runtime (postponable specifically *until* Development-phase generation exists — building it earlier is not wrong, just not urgent).
**Critical path:** SAF-25 → Platform Pack foundation → first real Generator Pack → Development-phase generation → Testing generation → a fully real execution of Gate C's worked example. This is the longest chain, and the only one gating the platform's stated core ambition (AF Vision: generating real Fiori/CAP/RAP/Integration Suite artifacts).

---

## Part 4 — Repository Strategy

**The monorepo decision is not reopened.** [ADR-0001](../adr/0001-pnpm-turborepo-monorepo.md) already decided this; re-litigating it here would be exactly the "redesign" this task forbids.

**The one genuinely new question — not previously asked, because Platform Packs at "hundreds of packs, multiple teams" scale did not exist as a live concern until the prior Repository Review's scalability assumptions — is where third-party-authored Platform Packs should live.** Recommendation: a **hybrid model**, layered on top of the existing decision, not replacing it:

- Core platform (`apps/`, `packages/`, `docs/`) stays in this monorepo, exactly as ADR-0001 decided.
- Platform Packs authored by the core team stay in `plugins/` inside this monorepo, exactly as today.
- Platform Packs authored by external contributors live in **their own repositories**, consumed as versioned packages through the exact same `plugin-sdk` contract every in-repo plugin already uses — this is not a new architectural seam, it is the existing Ports & Adapters boundary (a plugin is already just "a package conforming to `plugin-sdk`'s `execute()` seam," per `PROJECT_PLAYBOOK.md`'s "How to introduce a new plugin") extended to a package that happens to live outside this git repository.

This preserves Turborepo/pnpm's monorepo benefits (shared tooling, one CI, one dependency-cruiser boundary check) for everything the core team ships, while giving external Platform Pack authors independence without requiring them to be granted write access to this repository — the same tradeoff most successful plugin ecosystems make, achieved here through a boundary the architecture already has, not a new one.

---

## Part 5 — Development Workflow

**Almost entirely already defined** in `PROJECT_PLAYBOOK.md` — Architecture Review Process, ADR Process, PR/Code Review (via `CODEOWNERS`), Testing Strategy, Documentation Strategy, and Release Process (Changesets → `dev` → `staging` → `prod`) all already exist and are not restated here.

**The one genuinely new addition** — because `PROJECT_PLAYBOOK.md` predates the constitutional/product-architecture layer entirely — is a decision tree for *which governance track a change belongs to*, since that layer now has two distinct weights:

| If the change touches... | Track | Because |
|---|---|---|
| AF, PXF, ECS, or XLS's own content | Full **Architecture Review Process** (ADR-weight) | These are constitutional; each one's own Governance section requires this |
| A `Port` (new or changed), a bounded context, or cross-context communication | Full **Architecture Review Process** | Already `PROJECT_PLAYBOOK.md`'s existing trigger — unchanged |
| PAS, CAP, PER, TOM, or CMM's own content | **A catalog update**, reviewed at normal PR weight | These documents are explicitly "revised freely," per their own stated governance — never ADR-gated |
| Implementing a capability CAP already catalogues as Planned/Roadmap | **Ordinary engineering work** | The capability, its owner, and its dependencies are already decided; building it is not an architectural decision |

**Quality gates, CI requirements, ADR requirements:** unchanged from `PROJECT_PLAYBOOK.md` and `DEFINITION_OF_DONE.md` — this document adds no new gate, since none is needed.

---

## Part 6 — Delivery Strategy

**Delivery is a user capability, per PAS's own Capability model — not a Git abstraction.** This section corrects a conflation present in the brief itself, in the same spirit as Gate C's earlier corrections: the brief's own list of targets (GitHub, Azure DevOps, GitLab, ZIP, SAP Build, SAP BTP, Cloud Foundry) blends two genuinely different concerns that the architecture already keeps separate.

| Category | Examples | Already defined? | Port |
|---|---|---|---|
| **Repository Providers** — where generated *source code* is published | GitHub, Azure DevOps, GitLab, Local ZIP | **No — Gate C's one named gap** | New: a `RepositoryPublisherPort`, to be defined following the exact pattern already used for every other external dependency (`LlmProviderPort`, `GraphStorePort`, `WorkflowEnginePort`) |
| **Deployment Providers** — where the *running application* is deployed | SAP BTP, Cloud Foundry, SAP Build (if used as a deployment target) | **Yes** — a named Platform Pack facet | [19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md); [ADR-0019](../adr/0019-execution-profiles-for-generated-applications.md)'s execution profiles |

**How both categories are implemented without changing the engineering lifecycle** (per Gate C's Part 12 finding, restated as strategy rather than validation): both sit behind a port; the Development/Deployment Lifecycle Workspaces (PAS §2.4, §2.6) never name a specific provider — they invoke a `Capability`/workflow action, and a `CapabilityProvider`-equivalent resolution picks the concrete provider, exactly as `Capability`/`CapabilityProvider` already do for every AI-fulfilled capability (ADR-0022). A GitHub adapter and an Azure DevOps adapter both implement the same `RepositoryPublisherPort`; a Cloud Foundry adapter and a SAP BTP adapter both implement the existing Deployment Provider facet. Neither the Lifecycle Workspace nor the `WorkflowRun` executing it needs to know which one is in play — this is not new engineering discipline, it is Hexagonal Architecture (AF #4) applied to the one place it had not yet been applied.

**No API is designed here**, per this task's own constraint — this section states the strategy (one new port, contract-tested like every existing one) and explicitly defers the port's shape to whichever engineering team is assigned it in Sprint 7 (Part 12).

---

## Part 7 — Implementation Milestones

| Milestone | Objectives | Dependencies | Exit criteria | Definition of Done |
|---|---|---|---|---|
| **Foundation** | Documentation Factory (CAP-003, CAP-004) real and shipped | Registry Runtime (already real) | Both capabilities have a registered `CapabilityProvider` and pass their `qualityGates` | `DEFINITION_OF_DONE.md`, plus CMM's Capability lifecycle rules |
| **Graph** | `graph-adapters/postgres-age` real; `DigitalTwinNode`/`Edge` fully persisted | None new (Digital Twin domain model partially exists already, per CMM's own finding) | A real project's graph can be queried via `GraphStorePort.traverse()` | Same, plus [16-project-digital-twin.md](../architecture/16-project-digital-twin.md)'s own self-review checklist |
| **Canvas** | The Engineering Canvas's four views render a real project's graph | Graph milestone | A Canvas Session displays all four views against real data, per ECS §6 | XLS §40's Definition of Done, ECS §15's Definition of Done |
| **Workflow** | Every Lifecycle Workspace transition (TOM-01–06) fires a real, named event | Foundation, Graph | Every `[GAP]`/Planned Event in TOM is closed | `DEFINITION_OF_DONE.md` |
| **Platform Packs** | SAF-25 closed; first real Generator Pack (Fiori) ships | SAF-25 | CAP-007 moves from Roadmap to Implemented | Same, plus doc19's Platform Pack facet checklist |
| **AI** | CAP-012–014 (Impact Analysis, Gap Detection, Root-Cause Assistance) real | Graph milestone | Each capability's illustrative agent becomes a real, registered `CapabilityProvider` | Same |
| **Enterprise** | Delivery Runtime (Repository Provider port) real; Testing generation (CAP-011) real; Gate C's worked example runs fully, end to end | Platform Packs, Delivery Runtime | Gate C's own walkthrough (docs/governance/gate-c-executable-architecture-validation.md §2) executes with zero Planned/Roadmap capabilities remaining in the chain it exercised | Same, plus a re-run of Gate C's own validation against real code |

---

## Part 8 — Technical Debt Prevention

**Mandatory, already established, not restated:** `TECHNICAL_DEBT_POLICY.md`'s prudent/reckless × deliberate/inadvertent framework; `PROJECT_PLAYBOOK.md`'s Technical Debt Process (logged, severity-classified, resolution-timelined at every Sprint Exit Gate); the existing fitness functions (`dependency-cruiser`, banned-keyword script, README-presence script).

**New, because the constitutional/product-architecture layer introduces new entity classes the original Sprint-0-era policy predates:**

| Practice | Mandatory? | Why |
|---|---|---|
| Every new `Capability`/`CapabilityProvider` registration gets a contract test, same discipline as any port-adapter pair | **Mandatory** | ADR-0022's own resolution-chain guarantee depends on this |
| Every new Platform Pack is isolated per SAF-25's (not-yet-closed) execution boundary before it ships real generation logic | **Mandatory** | Named explicitly in `PROJECT_CONTEXT.md` as a hard prerequisite |
| Every registry entity (`NodeTypeDefinition`, `RelationshipTypeDefinition`) is added via the registry, never as an ad hoc string | **Mandatory** | Direct CMM Part 1 principle (Extensibility) |
| Feature flags for incomplete Lifecycle Workspace stages | **Recommended, not mandatory** | Useful during the Foundation→Enterprise ramp, but not a constitutional requirement anywhere |
| Backward-compatible event versioning (`.vN` suffix) for every new event this strategy's milestones introduce | **Mandatory** | Already a stated event-model rule ([06-event-model.md](../architecture/06-event-model.md)), not new here, just newly load-bearing as TOM's Planned Events get built |

---

## Part 9 — Architecture Drift Prevention

**Already fully mechanized** via `PROJECT_PLAYBOOK.md`'s Architecture Drift Management — checked every Sprint Exit Gate against `ARCHITECTURE_FREEZE.md` and the fitness functions. Not restated or redesigned here.

**The one new layer, because two governance weights now coexist (Part 5):**

| Question | Answer |
|---|---|
| When is an ADR required? | Unchanged — a change to a `Port`, a bounded context, or cross-context communication (`PROJECT_PLAYBOOK.md`, existing trigger) |
| When is Architecture Board review required? | Unchanged for AF/PXF/ECS/XLS; **new** — a change to PAS/CAP/PER/TOM/CMM's *entity model itself* (not a status update, not a new catalog row) should still get a lightweight Board review, even though it isn't ADR-gated, because it is exactly the kind of change CMM Part 11 already treats as consequential |
| When may implementation proceed autonomously? | Building any capability CAP already lists as Planned/Roadmap, exactly as specified — no review needed beyond ordinary PR review |
| When does an engineering decision become an architectural decision? | The moment it would require inventing a concept not in CMM Part 2's entity inventory — at that point, stop, per this task's own repeated instruction across every prior review, and route it through the Architecture Review Process |

---

## Part 10 — AI-Assisted Engineering

This is AI assisting the *engineering process itself* — a different angle from Gate C Part 11 (AI as a platform capability), but governed by the identical principle, applied one level down: **AI proposes, the human disposes** (PXF §9.1) applies exactly as much to an AI coding assistant proposing a PR as it does to an AI agent proposing a `Requirement`.

| AI engineering activity | Human approval requirement | Required context | Traceability requirement |
|---|---|---|---|
| Code generation | PR review per `CODEOWNERS`, same as any human-authored PR | The relevant `Capability`/port definition, existing adjacent code | Commit attributes authorship; no silent AI-authored merges |
| Specification generation (Functional/Technical Spec capabilities) | Same `qualityGates`/human review CAP-003/004 already define | Requirement, Architecture Decision | Same `derived-from`/`implements` edges any specification needs |
| Refactoring | Full PR review; a refactor claiming "no behavior change" still requires the same test suite to pass, never a reduced bar | Existing tests, `ARCHITECTURE_PRINCIPLES.md` | Standard git history |
| Testing (generating test suites) | Reviewed by the owning persona (QA Engineer, PER-007) before treated as authoritative | Artifact + Requirement/AcceptanceCriterion | `validated-by` edge, same as any test suite |
| Review (AI-assisted code review) | Never replaces the human reviewer `CODEOWNERS` names — may assist, never approve | The PR's diff and its architectural context | The human approval remains the recorded one |
| Documentation | `PROJECT_PLAYBOOK.md`'s existing Documentation Strategy — written alongside code, never backfilled, whoever authors it | The code/decision being documented | Same as any documentation change |
| Impact Analysis | This *is* an AI capability already (CAP-012) — no additional human approval requirement beyond what CAP-012 already states | Bounded graph neighborhood | Attribution to the specific `CapabilityProvider` |
| Architecture validation | AI may run fitness-function-style checks; only a human (or the Architecture Board) makes the resulting Accept/Reject call | `ARCHITECTURE_FREEZE.md`, the relevant ADR | Same as Architecture Drift Management already requires |

**Safety boundary, stated once for all eight rows above:** no AI-assisted engineering activity is ever merged, approved, or promoted without the same human review this repository already requires of a human-authored change — AI-assisted engineering gets no shortcut through `CODEOWNERS`, the Definition of Done, or the Architecture Review Process.

---

## Part 11 — Engineering KPIs

Engineering-execution metrics only, grounded in data this repository already tracks or could track without inventing a new measurement system.

| KPI | Source | Why it matters |
|---|---|---|
| Lead Time (idea → shipped capability) | Sprint Exit Gate records | Standard flow metric |
| Deployment Frequency | Release Process's `dev`→`staging`→`prod` train (`PROJECT_PLAYBOOK.md`) | Already the platform's own release cadence measure |
| Architecture Compliance | `dependency-cruiser` violation count (currently 0/1445 dependencies), banned-keyword violations (currently 0/80 files) | Real, already-measured today, not a new metric |
| Capability Completion | CAP catalog's own Status field distribution (currently 1 Implemented / 3 Planned / 10 Roadmap of 14) | Directly ties execution progress to the catalog this whole strategy is built on |
| Technical Debt | `TECHNICAL_DEBT_POLICY.md`'s severity-classified register | Already tracked |
| Platform Pack Adoption | Count of registered `CapabilityProvider`s with `providerType: plugin`, per pack | Directly measurable once the Registry Runtime is real |
| AI Utilization | Count of `CapabilityProvider`s with `providerType: agent` actually invoked per sprint | Ties to CMM's own identity model |
| Traceability Coverage | The traceability-completeness policy-as-code check's pass rate ([16-project-digital-twin.md §5](../architecture/16-project-digital-twin.md)) | Already a defined, checkable rule — just not yet automated |
| Test Coverage | `CODING_STANDARDS.md`'s existing coverage floors | Already tracked |
| Developer Productivity | Standard team-level throughput (stories/sprint against `DEFINITION_OF_READY.md`-passing backlog items) | Existing sprint-planning data |

No business KPI (revenue, customer adoption, etc.) appears here, per this task's own instruction — every row above measures engineering execution against architecture this platform already defines.

---

## Part 12 — Sprint Mapping

| Sprint | Objectives | Deliverables | Dependencies | Critical path? | Expected risks |
|---|---|---|---|---|---|
| **Sprint 5** | Documentation Factory | CAP-003, CAP-004 Implemented | Registry Runtime (real) | No — parallel to Graph work | Low — same pattern as the one already-shipped capability |
| **Sprint 6** | Graph Runtime; Architecture & Design | `graph-adapters/postgres-age` real; CAP-002 Implemented | Sprint 5's Registry work not required (independent stream) | **Yes** | Real infra risk — this is genuinely new database/graph-query work, not a repeat of an existing pattern |
| **Sprint 7** | Platform Pack foundation; Delivery Runtime | SAF-25 closed; `RepositoryPublisherPort` defined with one adapter (e.g., GitHub) | None blocking (both streams independent) | **Yes**, for Platform Pack side | Execution-isolation work (SAF-25) is the least-specified item in this entire strategy — budget the most schedule risk here |
| **Sprint 8** | First real Generator Pack; AI cross-cutting capabilities | CAP-007 Implemented; CAP-012–014 Implemented | Sprint 6 (Graph), Sprint 7 (Platform Pack foundation) | **Yes** | Convergence sprint — three streams landing together raises integration risk |
| **Sprint 9** | Testing generation; remaining Delivery adapters; close remaining gaps | CAP-011 Implemented; Azure DevOps/GitLab/ZIP adapters; `CI-B5` closed; CMM's three named gaps resolved | Sprint 8 | **Yes** | Re-running Gate C's own worked example end-to-end for the first time with real code — the first point this strategy could be falsified if something doesn't fit |

---

## Part 13 — Engineering Readiness Assessment

| Dimension | Score | Basis |
|---|---|---|
| Execution Readiness | 84/100 | Every near-term stream (Documentation Factory) needs no new infrastructure to start |
| Engineering Organization | 88/100 | Boundaries map cleanly to CMM's own implementation surfaces; the one open item (`CODEOWNERS` not yet covering `docs/ux/`/`docs/product/`) was already found and is a one-line fix |
| Dependency Clarity | 90/100 | The critical path (SAF-25 → Platform Packs → Development-phase generation) is singular and well-evidenced, not guessed |
| Repository Strategy | 92/100 | The existing monorepo decision holds; the one refinement (hybrid for external Platform Packs) uses an already-existing seam |
| Delivery Strategy | 80/100 | Correctly identifies and corrects the Repository-Provider/Deployment-Provider conflation; the actual port remains unbuilt (expected, tracked, Sprint 7) |
| Architecture Preservation | 93/100 | Every mechanism this strategy relies on (Drift Management, ADR Process, fitness functions) already exists and is not being re-invented |
| Technical Debt Prevention | 87/100 | Existing policy fully covers the code layer; the new registry-entity-specific practices are narrow additions, not a new system |
| **Overall Readiness** | **88/100** | A strategy that adds exactly what the constitutional/product-architecture layer newly requires, and nothing else |

### Remaining recommendations

| Item | Classification |
|---|---|
| Update `CODEOWNERS` for `docs/ux/`/`docs/product/` (carried forward, already found once) | **Recommended** |
| Define `RepositoryPublisherPort` (Sprint 7) | **Recommended** — real, scheduled, not blocking Sprint 5/6 |
| Close SAF-25 (plugin execution isolation) | **Recommended**, though its schedule risk is the highest of any single item in this strategy |
| Resolve CMM's three named gaps (branching, Capability deletion policy, JSON Schema formalization) | **Optional/Recommended**, per CMM's own classification, unchanged here |

**No Critical item was found.** Nothing in this strategy requires architecture to be reopened before Sprint 5 begins.

---

## Part 14 — Engineering Charter

**This section is the formal handoff from Architecture to Engineering.**

### What architecture guarantees

- A complete, validated product model (PAS), object model (CMM), capability catalog (CAP), persona catalog (PER), and transition ownership matrix (TOM), each fully traceable to AF/PXF/ECS/XLS.
- Gate C's validation that one complete engineering project can be represented, governed, and traced end to end using only what already exists.
- A single, stable set of extension mechanisms (capability registration, node/relationship type registration, Platform Pack contribution) that absorb new work without requiring architecture to change.

### What engineering owns

- Building every Planned/Roadmap capability in the CAP catalog, on the sequencing this strategy's dependency graph (Part 3) and sprint mapping (Part 12) establish.
- Closing the one real, named architectural gap this whole review arc surfaced (`RepositoryPublisherPort`) — using the existing Ports & Adapters pattern, not inventing a new one.
- All ordinary engineering practice already governed by `PROJECT_PLAYBOOK.md`, `CODING_STANDARDS.md`, `TECHNICAL_DEBT_POLICY.md`, and `DEFINITION_OF_DONE.md` — none of which this Charter changes.

### What may evolve without an ADR

- PAS, CAP, PER, TOM, and CMM — each explicitly, by its own stated governance, "revised freely" as implementation reality is learned.
- Anything inside a Platform Pack, provided it stays behind `plugin-sdk`'s existing seam.
- Sprint-to-sprint sequencing (Part 12) — a plan, not a constitutional commitment.

### What requires an ADR

- Any new or changed `Port`.
- Any new bounded context.
- Any change to cross-context communication.
- Unchanged from `PROJECT_PLAYBOOK.md`'s existing Architecture Review Process trigger — this Charter does not add a new one.

### What requires constitutional amendment

- Any change to AF, PXF, ECS, or XLS's own content — governed by each document's own Governance section (precedence, conflict resolution, versioning, all established in the earlier governance patch, ED-014).
- A genuinely new Digital Twin node or relationship *category* (not a new type within an existing category) — [ECS §12.3](../product/00-engineering-canvas-specification.md) already names this as constitutional-weight.

### What engineering teams must never violate

- AF's eighteen non-negotiable principles.
- PXF/ECS/XLS's every "must"-tier rule, verified per each document's own Design Review Checklist.
- The Digital Twin's core invariants: never hard-delete a cross-referenced aggregate; never silently promote `ai-inferred` to `declared`; never write to the graph except by projecting a domain event.
- The one rule that recurs, unbroken, at every review this platform has undergone since the Constitutional Review: **no engineering decision may introduce a concept that isn't already in the entity inventory this Charter hands off** — if one seems necessary, that is the signal to stop and route it through the Architecture Review Process, not to proceed.

---

Architecture is complete. This Charter is the record of what Engineering now owns, what it may change freely, and what it must never touch without going back through the process that built it in the first place.

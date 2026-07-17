# Roadmap

This is the official product roadmap for SAP App Factory. It distinguishes four different things that are easy to conflate — **only the Product Roadmap drives implementation.** The other three inform planning but are never treated as committed work.

**Current Delivery Scope vs. Future Platform Vision.** Everything under Vision through Future Ideas below — Sprints 0 through 8, all of it — is **100% SAP-focused, unchanged**. The first supported enterprise platform is SAP; the first supported user experience is SAP application delivery. A separate [Future Platform Vision](#future-platform-vision-platform-packs) section at the end of this document describes a longer-horizon, unscheduled, un-committed vision for supporting additional enterprise platforms (Salesforce, Oracle, Microsoft, ServiceNow) through the Platform Pack architecture ([ADR-0023](docs/adr/0023-platform-kernel-and-platform-pack-architecture.md)). That section does not change, expand, or reorder anything in the Current Delivery Scope — it exists only so "the kernel could support other platforms someday" and "Sprint 1 builds SAP support" are never confused with each other.

## Vision

SAP App Factory is an AI-native engineering platform that turns business requirements into delivered SAP solutions — orchestrating AI agents and MCP servers to produce SAP Fiori/SAPUI5 apps, SAP GUI modernization, CAP services, RAP/ABAP, Integration Suite artifacts, architecture and testing documentation, deployment pipelines, and user manuals. It should feel like engaging an experienced SAP delivery organization, not calling a coding assistant. Full statement: [00-vision-and-principles.md](docs/architecture/00-vision-and-principles.md).

## Product Strategy

Build outward from one proven vertical slice at a time, never from a horizontal platform layer speculatively ahead of a real consumer. Sprint 0 proved the foundation (ports, contracts, one real plugin, one real workflow). Every sprint from Sprint 1 forward proves one more complete, user-visible capability on top of that foundation — Discovery → Documentation → Local Generation → Quality → Enterprise Integration → Multi-Agent Delivery → Governance → Marketplace — each depending on the previous sprint's real output, never a placeholder. This is the same "extract on second occurrence, not first" discipline Sprint 0 established at the code level, applied at the product-sequencing level.

## Release Strategy

Changesets-driven semantic versioning for individually meaningful packages (`ports`, `plugin-sdk`, and any package a future consumer needs a stable contract from); environment progression is `dev` (auto-deploy on merge to `main`) → `staging` (auto-deploy on version tag) → `prod` (manual approval gate, tied to a recorded change — the concrete ITIL-alignment mechanism). Containers are built once and promoted unchanged across environments — never rebuilt per environment. Full detail: [11-git-and-cicd-strategy.md](docs/architecture/11-git-and-cicd-strategy.md).

**Current release status:** none. No version has shipped past `dev` — Sprint 0 built and locally verified the foundation only; the CI pipeline itself has never executed on a real GitHub Actions runner (see [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)).

## Release Train

| Stage | Trigger | Status |
|---|---|---|
| `dev` | Merge to `main` | Not yet active — pending the first real push and CI run |
| `staging` | Version tag (Changesets release PR merge) | Not yet reached |
| `prod` | Manual approval, tied to a recorded change | Not yet reached |

No fixed cadence (e.g., "every two weeks") is committed yet — the release train activates once Sprint 1 produces something real enough to deploy.

---

## Product Roadmap *(drives implementation)*

The full sprint-by-sprint table — theme, objective, deliverables, dependencies, exit criteria, target release — lives in [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md)'s Official Roadmap section, maintained jointly with this document. Summary:

| Sprint | Theme | Business Value |
|---|---|---|
| 0 | Platform Foundation | De-risks everything after it — proves the architecture holds before any product capability is built on top of it. *(Complete.)* |
| 1 | Discovery Workspace | First capability a real user can touch — validates the whole pipeline shape with the lowest-risk possible slice (capture, don't generate yet). |
| 2 | Documentation Factory | First real reduction in delivery-team hours: auto-drafted FS/TS/architecture docs instead of hand-written ones. |
| 3 | Local Application Factory | Proves the platform can produce a *running* application, not just documents — the credibility milestone for any design partner. |
| 4 | Quality Engineering | Removes the "but is the generated code actually tested" objection — generated apps ship with generated tests and a demo. |
| 5 | SAP Enterprise Integration | Unlocks real customer deployments — the platform stops being a local-only proof of concept. |
| 6 | AI Delivery Organization | The differentiator the vision statement names explicitly: multiple coordinated agents, not one chatbot wrapper. |
| 7 | Enterprise Governance | Unlocks regulated/enterprise buyers who require full ITIL/PMO traceability, not just working software. |
| 8 | Marketplace and Platform Intelligence | Turns the platform into an ecosystem — third-party plugins and compounding value from the platform's own usage data. |

### Epics (Sprint 1)

**Status: Complete.** VS-1 (Discovery Workspace) shipped all 19 engineering tasks, passed its Exit Gate, and passed the project's first real CI run (2026-07-17). See [docs/execution/sprint-1/10-vs1-exit-gate-report.md](docs/execution/sprint-1/10-vs1-exit-gate-report.md) and the VS-1 Engineering Retrospective (`CONTINUOUS_IMPROVEMENT_BACKLOG.md`, `ENGINEERING_DECISION_LOG.md`) for the full accounting. See [docs/execution/sprint-1/](docs/execution/sprint-1/README.md) for the Epic/Vertical Slice/Task breakdown — **Epic 1: Idea Capture & AI-Guided Structuring** and **Epic 2: Discovery Approval & Project Creation** — which superseded the indicative epic list below as the authoritative execution structure.

**Sprint 2 is not yet execution-ready** — no Product Design Review, Execution Package, or ticket-numbered backlog exists for Documentation Factory yet. The retrospective's VS-002 Readiness Report names this, plus plugin process/container isolation (SAF-25, below), as what must happen before implementation starts.

- **Requirement Capture** — a real UI and application-layer use case for `context-requirements`.
- **First Real Workflow Run** — a Discovery workflow definition exercised end to end, not the contract-test-only skeleton.
- **Sprint 1 Technical Debt Closure** — the `drizzle-orm` CVE (✅ resolved), the first live CI run (✅ resolved 2026-07-17), plugin isolation ahead of Sprint 2's real generation logic (still open — see `CONTINUOUS_IMPROVEMENT_BACKLOG.md`'s `CI-B6`).

### Features (Sprint 1, indicative — finalized at sprint planning)

- Requirement submission form (`apps/web`).
- Requirement → workflow-run trigger (`apps/api-gateway` → `apps/orchestrator`).
- A visible, traceable result view for a processed requirement.

### Dependencies

Sprint 1 depends only on the Sprint 0 baseline (frozen architecture, full port/contract-test set). Sprints 2+ each depend on the *real* output of the sprint before them — see [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md)'s Official Roadmap table for the exact dependency per sprint.

### Exit Gates

Every sprint closes with a Sprint Exit Gate (Sprint Exit Gate, Technical Debt Review, Architecture Drift Review, ADR Review, Documentation Review — see [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md)'s Engineering Planning Principles and [PROJECT_PLAYBOOK.md](PROJECT_PLAYBOOK.md) for the process). No sprint is considered closed, and no next sprint begins in earnest, without one.

### Planned Deliverables

See [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md)'s Official Roadmap "Major Deliverables" column — not duplicated here to avoid the two documents drifting apart.

---

## Engineering Roadmap *(supports the Product Roadmap — does not independently drive implementation)*

Horizontal/technical work exists only to support the active vertical slice, per the Engineering Planning Principles. The engineering items below are not scheduled independently — each is pulled forward only when a Product Roadmap sprint actually needs it:

- Temporal/durable-execution decision (SAF-24) — pulled forward if Sprint 1's or a later sprint's workflow needs durability sooner than its default position (Sprint 1, deferrable).
- Plugin process/container isolation (SAF-25) — pulled forward no later than the sprint before real generation logic ships (Sprint 2).
- `generated-app-kit`'s seven ports (SAF-31) — pulled forward exactly when Sprint 3 needs them, not before.
- Redis Streams, shared resilience state (SAF-26, SAF-27) — pulled forward only once multi-replica load is real, not on a calendar date.
- Read-models (SAF-28) — pulled forward when Sprint 7's dashboards need them, potentially sooner if an earlier sprint needs a real dashboard.

## Release Roadmap *(when work gets promoted, not what gets built)*

- `dev`: activates with Sprint 1's first mergeable work.
- `staging`: activates once Sprint 1 or 2 produces its first tagged release.
- `prod`: activates at Sprint 5 at the earliest — Sprint 5 is the first sprint whose exit criteria requires a real (sandboxed) external deployment target.

## Future Ideas *(not sequenced, not committed — informs the Product Roadmap, never substitutes for it)*

Named in the platform's Vision but not yet placed on the Product Roadmap above:

- **RAP/ABAP generation** and **SAP GUI modernization** — both named explicitly in [00-vision-and-principles.md](docs/architecture/00-vision-and-principles.md)'s vision statement, alongside Fiori/SAPUI5, CAP, and Integration Suite; neither is yet sequenced into any of the 9 named sprints on the Product Roadmap above. Sequencing either is a sprint-planning decision, not an architectural one — see [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md)'s Capability Maturity Matrix for current status.
- **Integration Suite artifact generation** — named in the vision statement, not yet sequenced.
- Anything beyond Sprint 8 — no sprint, epic, or feature exists past Marketplace and Platform Intelligence; ideas about "what comes after" belong here, not in the Product Roadmap, until they're actually planned.

An idea moves from this list to the Product Roadmap only through real sprint planning against [DEFINITION_OF_READY.md](DEFINITION_OF_READY.md) — never by being added here with enough detail to look committed.

---

## Future Platform Vision (Platform Packs)

**This section is vision, not a roadmap commitment — nothing here is scheduled, ticketed, or sequenced into any sprint.** It exists to record a long-horizon architectural direction confirmed by [ADR-0023](docs/adr/0023-platform-kernel-and-platform-pack-architecture.md) (Platform Kernel and Platform Pack Architecture), reviewed strategically ahead of Sprint 1 without changing Sprint 1 itself. See [19-platform-kernel-and-platform-packs.md](docs/architecture/19-platform-kernel-and-platform-packs.md) for the full kernel-independence review behind it.

**The confirmed direction:** the platform's kernel (bounded contexts, capability model, workflow engine, digital twin, security, governance, observability, event model) is enterprise-platform-agnostic by design, mechanically enforced since Sprint 0. Everything specific to one enterprise platform — its generators, templates, validators, deployment providers, documentation conventions, discovery knowledge, and security extensions — belongs in a **Platform Pack**, a registered, self-contained unit the kernel talks to but never contains logic for.

- **SAP is Platform Pack #1.** Every sprint on the Current Delivery Scope above — 0 through 8 — builds out the SAP Platform Pack's capabilities on top of the kernel. This is not a future plan; it's what "Current Delivery Scope" *means*.
- **Future Platform Packs** — Salesforce, Oracle, Microsoft, ServiceNow, or others — are a possible future direction, not a commitment. None has a sprint, a ticket, or a target release. Each would be added the same way SAP was: as a Platform Pack registered against the same unmodified kernel.
- **What has to be true before any future Platform Pack is real work, not vision:** the `PlatformPack` aggregate itself would need to exist (identified, not built, by ADR-0023), a second real enterprise platform's requirements would need to be understood well enough to plan against [DEFINITION_OF_READY.md](DEFINITION_OF_READY.md), and it would need to clear the same product-strategy bar every Current Delivery Scope sprint clears — real business value, not novelty.

**What this vision explicitly does not do:** it does not add a Sprint 9, it does not pull any Platform Pack work into Sprint 1–8, and it does not require any kernel code to change today. The only thing this vision changes about present-day work is a naming and grouping discipline going forward (business-oriented capability names, a platform-neutral `PortCategory` label, a pack-scoped knowledge path) — each applied prospectively, never retroactively, and never inside Sprint 1.

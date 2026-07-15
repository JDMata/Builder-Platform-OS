# Project Playbook

This is the operational handbook for SAP App Factory — the *how* that sits underneath [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md)'s *what and why*. If a principle document and this playbook ever disagree on process mechanics, this playbook is what's wrong and needs updating — principles don't change per sprint, process details do.

## How to begin a sprint

1. Confirm the previous sprint's Sprint Exit Gate actually passed (see below) — a sprint does not start on top of an unclosed one.
2. Read [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — Current Sprint, Upcoming Sprint Goal, Deferred Decisions, Current Risks.
3. Pull the sprint's theme, objective, and exit criteria from [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md)'s Official Roadmap / [ROADMAP.md](ROADMAP.md)'s Product Roadmap.
4. Turn the theme into ticket-numbered stories, each checked against [Definition of Ready](#definition-of-ready) before being pulled in.
5. Confirm every story is a slice of the vertical capability the sprint promises — not a horizontal layer with no user-visible endpoint this sprint (Engineering Planning Principles, [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md)).
6. Update [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md): Current Sprint, Current Epic, Current Stories, Upcoming Sprint Goal → Current Goal.

## How to end a sprint

1. Run the Sprint Exit Gate (below).
2. Run the Technical Debt Review, Architecture Drift Review, ADR Review, and Documentation Review (below) — all four, not a subset.
3. Update [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md): move the closed sprint out of Current Sprint, record its outcome, set the next sprint's Upcoming Sprint Goal.
4. Update [PLATFORM_MATURITY.md](PLATFORM_MATURITY.md)'s Capability Maturity Matrix for anything the sprint actually shipped.
5. Tag a baseline if the sprint changed anything load-bearing enough to be worth pinning (not mandatory every sprint — Sprint 0's baseline was warranted because it was the architecture-freeze point; most sprints won't need their own tag).
6. Run the Project Retrospective (below).

## Sprint Exit Gate

Modeled directly on [docs/governance/sprint-0-exit-gate/](docs/governance/sprint-0-exit-gate/README.md), scaled to one sprint:

1. **Completion Audit** — every story the sprint committed to: shipped, partially shipped, or not shipped, with evidence (a running feature, a passing test, a merged PR) — not a self-report.
2. **Vertical Slice Validation** — confirm the sprint's exit criteria (from the roadmap) is independently demonstrable end to end, the same way [13-sprint1-handoff.md](docs/governance/sprint-0-exit-gate/13-sprint1-handoff.md) and the vertical-slice demo (`tools/sprint0-demo/`) proved Sprint 0's.
3. **Go/No-Go Decision** — GO, GO WITH MINOR CORRECTIONS, or NO-GO, stated explicitly, recorded in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)'s Current Decisions.

A sprint that ends NO-GO does not roll its stories into the next sprint silently — the next sprint's planning must explicitly account for the carryover as its own story, not an invisible continuation.

## Definition of Ready

A story may be pulled into a sprint only once it has:

- A user-visible or agent-invocable outcome stated in one sentence.
- The bounded context(s), port(s), and adapter(s) it touches identified — and confirmed to require no ADR (or, if it does, the ADR already Accepted before the story is pulled in).
- Acceptance criteria a Sprint Exit Gate can mechanically check (a test, a demo script, a working endpoint) — not a subjective judgment call.
- No unresolved dependency on a story not yet Done.

Full detail and the canonical checklist: [DEFINITION_OF_READY.md](DEFINITION_OF_READY.md).

## Definition of Done

A story is Done only when, per the Engineering Planning Principles' "every completed feature must" list:

- It works end to end, demonstrated, not just unit-tested in isolation.
- Its capabilities are registered in the Capability Registry.
- It emits events for every domain-meaningful transition via the transactional outbox.
- It has documentation — package README, any architecture doc it makes inaccurate, and (if cross-cutting) an ADR.
- It has tests — unit coverage for new domain logic, contract tests for new/changed port-adapter pairs, and end-to-end proof of the slice.
- It updates the Project Digital Twin (once built, SAF-34–37) or, until then, is traceable through existing means.
- CI is green — build, typecheck, lint (ESLint + dependency-cruiser), format check, and all fitness functions.

## Architecture Review Process

Triggered whenever implementation suggests the frozen architecture ([ARCHITECTURE_FREEZE.md](ARCHITECTURE_FREEZE.md)) needs to change:

1. **Stop.** Do not implement the change speculatively "to see if it works."
2. **Write the ADR** — the decision, the alternatives considered, the consequences (see [docs/adr/README.md](docs/adr/README.md) for the template).
3. **Impact Analysis** — which bounded contexts, ports, adapters, and fitness functions (`dependency-cruiser.config.cjs` rules, banned-keyword/README scripts) are affected, and whether any require a corresponding fitness-function change.
4. **Architecture Review** — an independent, evidence-based check against the current [BASELINE.md](BASELINE.md) and [ARCHITECTURE_FREEZE.md](ARCHITECTURE_FREEZE.md) — not the same person who wrote the ADR self-certifying it.
5. **Approval** — recorded in [ARCHITECTURE_DECISION_INDEX.md](ARCHITECTURE_DECISION_INDEX.md) as `Accepted` before implementation begins.
6. Only after approval: implement, then update [BASELINE.md](BASELINE.md), [ARCHITECTURE_FREEZE.md](ARCHITECTURE_FREEZE.md) (if the frozen surface itself changed), and any affected fitness function.

## ADR Process

- One ADR per architecturally significant decision — never bundled, never retrofitted after the fact to justify something already built.
- Status lifecycle: `Proposed` → `Accepted` (or `Rejected`) → optionally `Superseded`/`Deprecated` later, each transition recorded in [ARCHITECTURE_DECISION_INDEX.md](ARCHITECTURE_DECISION_INDEX.md).
- No ADR is implemented ahead of its own approval — this is checked mechanically by the ADR Review at every Sprint Exit Gate.
- Template and existing ADR list: [docs/adr/README.md](docs/adr/README.md).

## Technical Debt Process

- Every item introduced in a sprint is logged, classified by severity (High/Medium/Low), and given a resolution timeline before the sprint's Exit Gate closes — per [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md).
- High-severity debt (e.g., the `drizzle-orm` CVE) blocks the sprint from a clean GO — it can still close GO WITH MINOR CORRECTIONS, but the correction and its timeline must be explicit.
- The full register lives in [12-risks-and-technical-debt.md](docs/architecture/12-risks-and-technical-debt.md); each Sprint Exit Gate reconciles new debt into it.

## PR Review / Code Review

- Every PR requires review from the relevant [CODEOWNERS](CODEOWNERS) path owner.
- Review checks: adherence to [CODING_STANDARDS.md](CODING_STANDARDS.md) and [ARCHITECTURE_PRINCIPLES.md](ARCHITECTURE_PRINCIPLES.md), a README for any new package, tests for any new domain logic or port/adapter pair, and — for anything touching a bounded context boundary — confirmation no new cross-context coupling was introduced.
- [.github/pull_request_template.md](.github/pull_request_template.md) is the checklist every PR author fills in before requesting review.
- A PR that requires an architectural change not yet ADR'd is not approved — it's redirected to the Architecture Review Process above.

## Testing Strategy

- Domain logic: unit tests, zero mocks, milliseconds to run (Testability principle).
- Ports: one shared contract-test suite run against every adapter behind that port (Liskov Substitution, enforced mechanically, not by convention).
- Vertical slices: an end-to-end proof the whole slice works together, not just that its parts pass in isolation — the same bar `tools/sprint0-demo/` set for Sprint 0.
- Coverage floors: [CODING_STANDARDS.md](CODING_STANDARDS.md).

## Documentation Strategy

- Documentation First: written before or alongside the code, never backfilled.
- Every package: a README (enforced by `tools/scripts/require-package-readmes.mjs`).
- Every architecture-relevant change: the matching doc in [docs/architecture/](docs/architecture/) updated in the same PR, not a follow-up ticket.
- Every cross-cutting decision: an ADR.
- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) is updated at the start and end of every sprint, and any time a decision changes an answer in it — never left stale between sprint boundaries.

## Release Process

Per [ROADMAP.md](ROADMAP.md)'s Release Strategy and Release Train: Changesets-driven versioning → `dev` on merge to `main` → `staging` on version tag → `prod` on manual approval tied to a recorded change. A release never skips a stage, and `prod` promotion always reuses the exact container built and verified in `staging` — never a rebuild.

## How to introduce a new bounded context

1. Confirm it's genuinely needed by the active vertical slice — not built ahead of demand (Engineering Planning Principles).
2. Write the ADR — new bounded contexts are architecturally significant by definition, this is never a same-PR-as-implementation decision.
3. Follow the Architecture Review Process above for approval.
4. Once approved: own Postgres schema, no cross-schema foreign keys, communicates only via domain events over the transactional outbox (Domain-Driven Design / Event-Driven Architecture principles) — implemented the same way as the platform's existing ten (soon eleven, with `context-notification`, SAF-38) bounded contexts.
5. Update [02-domain-model.md](docs/architecture/02-domain-model.md), [BASELINE.md](BASELINE.md)'s Bounded Contexts section, and [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md).

## How to introduce a new capability

1. Define it as a `Capability` in application-owned terms (Capability/CapabilityProvider model, [ADR-0022](docs/adr/0022-capability-model-provider-abstraction.md)) — never a workflow step that directly names a specific agent or plugin.
2. Register it in the Capability Registry so any workflow can request it by capability, not by provider.
3. Provide at least one `CapabilityProvider` (an agent, a plugin, or a human-in-the-loop step) — the same capability may later gain additional providers without touching the workflow that requests it.
4. Document and test per the Definition of Done above.

## How to introduce a new plugin

1. Confirm the plugin conforms to `plugin-sdk`'s `execute()` seam — no inline SAP-specific logic in core code (Plugin Architecture principle).
2. Confirm the plugin's own generated output is itself Ports & Adapters-architected, runnable as Local POC, Hybrid, or Enterprise per [ADR-0019](docs/adr/0019-execution-profiles-for-generated-applications.md).
3. Add the plugin to the `plugin-import-boundary` dependency-cruiser rule's allow-list only for the specific consumers that need it (`apps/orchestrator/src`, `apps/worker/src`, or a demo tool) — never a blanket allow.
4. Contract-test the plugin against `plugin-sdk`'s interface, same as any other port-adapter pair.

## How to introduce a new MCP server

1. Confirm it's a genuinely new external tool surface, not something an existing MCP server or plugin already exposes.
2. Wrap it behind the same port-and-adapter discipline as any other external dependency (Hexagonal Architecture) — core code never imports an MCP SDK directly.
3. Design its tool bindings to be agent-composable per the AI First principle — structured, machine-callable, replayable/auditable.
4. Document it in [.ai/README.md](.ai/README.md) alongside the agents authorized to use it.

## How to introduce a new AI provider

1. Confirm the addition goes entirely behind `LlmProviderPort` (or the relevant existing port) — no core or application code references the provider's SDK directly (No Vendor Lock-In).
2. Contract-test the new adapter against the same suite every other adapter behind that port runs.
3. No workflow or agent definition hard-codes the provider by name — providers are selected by configuration/capability resolution, never by a literal string scattered through business logic.

## How to introduce a new agent

1. Define it as an authored, reviewed, versioned file in [.ai/](.ai/README.md) — purpose, permissions, memory, escalation/approval behavior — never an ad hoc prompt embedded in application code.
2. Register the agent as a `CapabilityProvider` for the capability/capabilities it fulfills (see "How to introduce a new capability" above) — never invoked directly by name from a workflow.
3. Give it the same authorization model as a human actor under Zero Trust — no implicit trust because "it's just an internal agent."
4. Every action it takes is recorded with enough structure (inputs, reasoning trace where available, outputs) to be replayed and audited.

## Incident Management

- An incident is any production (or, pre-`prod`, `staging`) behavior that violates a stated exit criterion, breaks Zero Trust, or exposes a security vulnerability.
- First action: contain, not diagnose — revert or roll back to the last known-good release on the Release Train before root-causing.
- Every incident gets a written record: what broke, blast radius, time to detect, time to mitigate, root cause, and a corrective action with an owner — filed as technical debt or an ADR-triggering architecture question, whichever applies.

## Problem Management

- A "problem" is a pattern across two or more incidents (or near-misses) sharing a root cause — not a single incident, and not the same thing as ordinary technical debt.
- Problems are reviewed at the nearest Sprint Exit Gate's Technical Debt Review, not left to accumulate silently across sprints.
- A problem whose root cause is architectural (not just a bug) is routed through the Architecture Review Process, not patched around repeatedly.

## Change Management

- Any change to `prod` follows the Release Process above — no direct hotfix to a running `prod` environment outside the Release Train, even under incident pressure; an incident fix still goes through `dev` → `staging` → `prod`, expedited in priority but not in sequence.
- Any change to the frozen architecture follows the Architecture Review Process above — no exceptions for "it's a small change."

## Architecture Drift Management

- Checked mechanically every sprint via the Architecture Drift Review (part of the Sprint Exit Gate) — comparing what shipped against [ARCHITECTURE_FREEZE.md](ARCHITECTURE_FREEZE.md) and the fitness functions (dependency-cruiser rules, banned-keyword script, README-presence script).
- Any drift found is not silently accepted as a fait accompli — it's either reverted, or retroactively routed through the Architecture Review Process to become an approved ADR (never both left undecided).

## Project Retrospective Process

- Held at the close of every sprint, after the Sprint Exit Gate, not instead of it.
- Reviews: what the sprint's Exit Gate found, what technical debt was introduced versus paid down, whether any Sprint Exit Gate item (Technical Debt/Architecture Drift/ADR/Documentation Review) surfaced a *process* gap rather than a one-off mistake.
- Any process gap found becomes an update to this playbook, not just a verbal lesson — the same reasoning as [ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md)'s "enforced, not just stated": a lesson that isn't written down here will recur.

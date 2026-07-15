# Sprint 0 Architecture Freeze

**Version:** Sprint 0 Baseline v1.0 (git tag `sprint0-baseline-v1.0`)
**Status:** Approved
**Approval Date:** 2026-07-15

## Purpose

Sprint 0 establishes the official architectural foundation of SAP App Factory. Every decision recorded in the 22 ADRs under [docs/adr/](docs/adr/), consolidated in [BASELINE.md](BASELINE.md) and indexed in [ARCHITECTURE_DECISION_INDEX.md](ARCHITECTURE_DECISION_INDEX.md), is now the platform's stable, governed starting point — verified end to end by the Sprint 0 Exit Gate audit ([docs/governance/sprint-0-exit-gate/](docs/governance/sprint-0-exit-gate/README.md)), which returned **GO WITH MINOR CORRECTIONS**.

## Architecture Governance

From this baseline forward, any future architectural change requires, **before implementation**:

1. **An Architecture Decision Record** — proposing the change, its alternatives, and its consequences, using [ADR_TEMPLATE.md](ADR_TEMPLATE.md). A revision to an existing ADR (a dated "Review update" section) satisfies this the same way a new ADR does.
2. **Impact Analysis** — which bounded contexts, ports, adapters, or fitness functions the change touches, and what breaks if the analysis is wrong.
3. **Architecture Review** — an independent, evidence-based check, not a self-certification by whoever proposes the change.
4. **Approval** — before implementation begins, not retrofitted onto a PR already in progress.

Architectural evolution from this point is **intentional and governed** — a well-meaning shortcut, an "obviously fine" small change, or a redesign justified only by familiarity with the code are not exemptions from this sequence. [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md)'s entire purpose is to make this the default path, not the exceptional one.

## Frozen Architecture

The following principles are now considered **stable** — implemented, verified, and not subject to casual revision:

- **Clean Architecture** — domain → application → ports → adapters, one direction, mechanically enforced (ADR-0002).
- **Domain-Driven Design** — ten bounded contexts (eleventh, `context-notification`, scheduled), each owning its own aggregates, cross-context communication event-only or via ports.
- **Hexagonal Architecture** — ports as the only seam application code depends on; composition roots as the only place a concrete adapter is constructed.
- **Event-Driven Architecture** — the real transactional outbox, versioned past-tense events, at-least-once delivery (ADR-0007).
- **Capability-based orchestration** — workflows request a `Capability`, never a specific agent or plugin (ADR-0022).
- **Plugin architecture** — SAP-specific logic confined to `plugins/*`, mechanically enforced (ADR-0006).
- **Local-first execution** — the platform's own dev loop and generated applications' `local-poc` execution profile both run with no cloud dependency by default (ADR-0019).
- **Project Digital Twin** — the event-projected knowledge graph model (ADR-0021), design-frozen even though implementation is Sprint 1/2.
- **Zero Trust** — explicit `RequestContext` on every port method, real OIDC federation, no ambient trust (ADR-0010).
- **Provider abstraction** — no vendor SDK called directly from application code; every provider sits behind a port and an adapter.
- **MCP abstraction** — `McpConnectionPort`, never a raw MCP client in application code (ADR-0004).
- **LLM abstraction** — `LlmProviderPort`, never a raw provider SDK in application code (ADR-0005).

## Allowed Changes

Sprint 1 and future sprints may, **without an architecture review**, freely:

- Add business capabilities (new `Capability`/`CapabilityProvider` registrations).
- Add plugins (new implementations of `CapabilityPlugin`).
- Add providers (new LLM/MCP adapters behind the existing ports).
- Add adapters (new implementations of any existing port).
- Add workflows (new workflow definitions/runs using the existing engine).
- Add documentation.

None of the above changes the platform's architecture — each is exactly what the ports/adapters/plugin/capability model exists to make additive.

**An ADR is required before changing:**

- Package boundaries (the one-package-per-context model, ADR-0018).
- Bounded contexts (adding, merging, splitting, or removing one).
- The workflow model (`WorkflowEnginePort`'s contract, or the state machine it describes).
- The capability model (`Capability`/`CapabilityProvider`'s shape, or how resolution works).
- The event model (envelope shape, versioning convention, delivery guarantee).
- The security model (AuthN/AuthZ mechanism, Zero Trust posture, secrets handling).
- The persistence model (schema-per-context, RLS strategy, the two-Postgres-role pattern).
- The plugin model (`CapabilityPlugin`'s contract, the `execute()` seam, isolation strategy).
- The Digital Twin model (node/edge shape, provenance tagging, registry discipline).

## Architecture Review Triggers

A formal Architecture Review Board is required before:

- Introducing new infrastructure technology (a message broker, a new database engine, a new cache).
- Introducing new persistence technology (anything beyond PostgreSQL/Drizzle for platform data).
- Changing the orchestration model (adopting Temporal or an equivalent — SAF-24's own spike explicitly ends in this review, not a unilateral adoption).
- Changing bounded contexts (adding, merging, splitting, or retiring one).
- Changing dependency rules (any edit to `dependency-cruiser.config.cjs`'s forbidden-import rules).
- Removing an architectural principle from the Frozen Architecture list above.

## Closing Statement

**Sprint 0 is complete.** Sprint 1 begins feature development on the foundation this baseline freezes. From this point forward, the platform evolves through governed ADRs, impact analysis, and architecture review — never through ad hoc redesign, however well-intentioned.

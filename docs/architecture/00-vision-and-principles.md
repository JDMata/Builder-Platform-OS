# 00 — Vision & Principles (Architecture Foundation, AF v1.0.1)

**Status:** Constitutional — the founding document of the platform's constitutional set, governing at the same authority level as every document that has since been declared its peer. See [PROJECT_CONTEXT.md](../../PROJECT_CONTEXT.md)'s "Constitutional documents" section for the current, authoritative enumeration of that set — this document does not restate a count or list of siblings inline, since either would go stale the next time a document is added.
**Authored as:** Distinguished Enterprise Architect / Principal Systems Engineer function.
**Scope:** the engineering domain — architecture, code structure, data/domain modeling, service boundaries, and infrastructure — for the life of the platform.
**Explicitly not in scope:** experience philosophy, the Engineering Canvas's work model, and visual/interaction language, each governed by its own constitutional document within its own declared domain (see Governance, below).

## Vision

SAP App Factory is an AI-native engineering platform that turns business requirements into delivered SAP solutions. It orchestrates multiple AI agents and MCP servers to generate SAP Fiori/SAPUI5 apps, SAP GUI modernization projects, CAP services (Node.js and Java), RAP/ABAP, Integration Suite artifacts, architecture and testing documentation, deployment pipelines, and user manuals.

The platform should feel like engaging an experienced SAP delivery organization — with intake, architecture review, delivery, QA, and documentation roles — not like calling a single coding assistant.

## Ten-year framing

This platform is expected to be maintained and extended for roughly a decade, by teams that are not the ones writing Sprint 0. Every decision here is judged against: *can a team five years from now understand why this exists, and change it without fear?* That framing drives three recurring choices in this plan:

1. **Boundaries over speed.** Every place where SAP-specific knowledge could leak into the core is treated as a design smell, not a shortcut.
2. **Reversibility over optimality.** Where a decision is expensive to reverse (workflow engine, event broker, IdP), we pick the option that keeps a clean seam to change our mind, even if it is not the theoretically "best" choice today.
3. **Boring technology in the core, ambition at the edges.** The plumbing (Postgres, Redis, OIDC, OpenTelemetry) is deliberately unexciting and well understood. The ambition of the product — multi-agent orchestration of SAP delivery — lives in the workflow, plugin, and agent layers, where it can be iterated on safely because the plumbing underneath doesn't move.

## Non-negotiable principles

These are cross-cutting constraints, not features. Every ADR and every later feature must be checked against this list before it is accepted:

| # | Principle | What it rules out |
|---|---|---|
| 1 | Clean Architecture | Frameworks/IO leaking into domain logic |
| 2 | Domain-Driven Design | Anemic models, shared "god" database schema across contexts |
| 3 | SOLID | God classes, concrete-type coupling, sprawling switch statements over type |
| 4 | Hexagonal Architecture | Business logic that imports an SDK (LLM, MCP, cloud) directly |
| 5 | Event-Driven Architecture | Contexts that only talk via synchronous RPC and shared tables |
| 6 | Plugin Architecture | Hardcoded SAP product logic anywhere outside `plugins/` |
| 7 | MCP abstraction layer | Direct MCP client wiring inside domain/application code |
| 8 | LLM abstraction layer | Hardcoding a single model/provider's API into business logic |
| 9 | Zero Trust Security | Implicit trust by network location; long-lived static credentials |
| 10 | OpenTelemetry | Bespoke logging/metrics formats per service |
| 11 | ITIL alignment | Production changes without change record, approval, rollback plan |
| 12 | PMO alignment | Work with no traceability to a backlog item / requirement |
| 13 | DevOps First | Manual deploy steps that aren't codified in CI/CD |
| 14 | API First | UI-only capabilities with no programmatic contract |
| 15 | Testability First | Code that requires live external services to unit test |
| 16 | Everything configurable | Hardcoded tenant, model, or environment assumptions |
| 17 | No vendor lock-in | Core code that only runs on one cloud/LLM/MCP vendor |
| 18 | No SAP-specific logic inside the core platform | Any of the above, specifically for SAP concepts |

## Governance

This document is governed on the same footing as every other constitutional document, following the standard added to all of them by the same governance patch (v1.0.1) that added this section.

- **Ownership:** the Distinguished Enterprise Architect / Principal Systems Engineer function is accountable for this document's currency and for arbitrating disputes between a proposed ADR or implementation and a principle stated here — the same role that owns architecture-level decisions such as [ADR-0021](../adr/0021-project-digital-twin-knowledge-graph.md), coordinated on Canvas-touching matters with the Engineering Canvas Specification's ownership (see that document's Governance section).
- **Amendment process:** this document changes only deliberately, via a new numbered revision (AF v1.1, v2.0, …), reviewed with the same weight as an ADR — never a silent edit incidental to shipping one feature.
- **Review process:** every ADR and every later feature is checked against this document's non-negotiable principles before being accepted, exactly as stated above.
- **Constitutional precedence and conflict resolution:** each constitutional document is authoritative within its own declared domain (this document's is the engineering domain, stated above). Where two constitutional documents both bear on a decision, the one whose declared domain most specifically covers that decision's subject matter governs — overlap between documents is expected and is not itself a conflict. A genuine, irreconcilable conflict between two constitutional documents — not merely overlapping emphasis — is escalated jointly to the owning functions of both documents, resolved by amending whichever document's claim was in error, and recorded in `ENGINEERING_DECISION_LOG.md`; it is never resolved by silently favoring one document over the other.
- **Versioning:** this document is versioned independently of the other constitutional documents (AF v1.0.1, next AF v1.1, …) — a revision to one constitutional document does not itself require revising the others, unless the change actually affects a claim made in them.

## Explicit Sprint 0 non-goals

To keep the foundation minimal and honest, Sprint 0 explicitly does **not**:

- Implement any generator (Fiori, CAP, RAP, ABAP, Integration Suite, etc.). `plugins/*` exist only as empty contract-conformant stubs.
- Implement real agent reasoning/prompting. `llm-adapters/*` return mocked/typed responses only.
- Stand up a production IdP, broker, or workflow engine. Ports are defined; adapters are skeletons.
- Multi-tenant data isolation beyond schema-level `tenant_id` columns and row-level security scaffolding.
- Any UI beyond a health/status page per app.

Anything not listed above but tempting to "just add while we're in there" should be logged in the backlog for a later sprint instead — see [12-risks-and-technical-debt.md](12-risks-and-technical-debt.md).

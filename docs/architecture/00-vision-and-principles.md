# 00 — Vision & Principles

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

## Explicit Sprint 0 non-goals

To keep the foundation minimal and honest, Sprint 0 explicitly does **not**:

- Implement any generator (Fiori, CAP, RAP, ABAP, Integration Suite, etc.). `plugins/*` exist only as empty contract-conformant stubs.
- Implement real agent reasoning/prompting. `llm-adapters/*` return mocked/typed responses only.
- Stand up a production IdP, broker, or workflow engine. Ports are defined; adapters are skeletons.
- Multi-tenant data isolation beyond schema-level `tenant_id` columns and row-level security scaffolding.
- Any UI beyond a health/status page per app.

Anything not listed above but tempting to "just add while we're in there" should be logged in the backlog for a later sprint instead — see [12-risks-and-technical-debt.md](12-risks-and-technical-debt.md).

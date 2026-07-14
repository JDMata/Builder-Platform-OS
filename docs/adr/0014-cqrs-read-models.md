# 0014 — CQRS-lite read models for cross-aggregate reporting
Status: Accepted
Date: 2026-07-14 (added in principal-architect review, see [13-principal-architect-self-review.md](../architecture/13-principal-architect-self-review.md) §5.2, §8.3)

## Context
DDD aggregates and their repositories ([02-domain-model.md](../architecture/02-domain-model.md)) are a write-side consistency boundary, deliberately scoped to one context. At 500+ projects and hundreds of workflows, the platform's actual dashboard/reporting needs ("all failed runs across my tenant this week," "projects with artifacts awaiting review") are inherently cross-aggregate and often cross-context. Forcing these through write-side repositories produces N+1 fan-out at best, or pressure to add cross-schema joins that break the no-cross-schema-FK rule ([ADR-0009](0009-postgresql-schema-per-context-drizzle.md)) at worst.

## Decision
Introduce a read side fed by the domain events that already exist for integration purposes ([ADR-0007](0007-event-driven-transactional-outbox.md)): `packages/read-models/*` defines projections (denormalized, query-shaped tables) in a dedicated `reporting` Postgres schema, updated by event subscribers. `api-gateway`/`web` query read-models directly for list/dashboard/search use cases and never go through write-side repositories for these. This is CQRS-lite: aggregates keep storing current state directly (not full event sourcing — see alternatives below); events are reused as the projection-update mechanism, not introduced solely for this purpose.

## Consequences
- Dashboard/reporting queries get a purpose-built, denormalized shape instead of being bent to fit aggregate boundaries — better performance and much simpler query code.
- Read models are eventually consistent with the write side (event-relay lag, typically sub-second to a few seconds). UI must reflect this (e.g., "as of a few seconds ago") rather than assume read-your-writes consistency across the CQRS boundary.
- A new class of bug becomes possible: a projection can drift from the write-side truth if a projector has a bug or misses an event. Mitigation: projections are rebuildable from the event log (replay), and a periodic reconciliation job compares projection counts/checksums against source-of-truth aggregates.
- Adds one more artifact type (`packages/read-models/*`) to the coding-standards/naming conventions ([10-coding-standards-and-naming.md](../architecture/10-coding-standards-and-naming.md)) — projections follow the same `<Context>Projection` naming pattern and get their own contract tests (given event stream X, projection ends in state Y).

## Alternatives considered
- **Full event sourcing (aggregates are pure event streams, no directly-stored current state)**: rejected — a much larger investment (replay performance at scale, snapshotting, event-stream schema evolution as the *only* source of truth) than the reporting problem requires; CQRS-lite gets the query-shape benefit without taking on event sourcing's full maintenance surface.
- **Cross-schema read replicas with ad-hoc joins for reporting**: rejected — reintroduces the exact coupling the schema-per-context boundary exists to prevent, and doesn't get denormalized, query-optimized shapes anyway.
- **Push all reporting to an external BI/data-warehouse tool (e.g., nightly ETL)**: rejected as the *only* mechanism — acceptable as a later addition for deep analytics, but too high-latency for in-product dashboards, which need near-real-time projections.

# 0003 — Modular monolith first; microservices only on proven need
Status: Accepted
Date: 2026-07-14

## Context
The vision implies many moving parts (agent orchestration, MCP, multi-LLM, multiple SAP stacks), which tempts an immediate split into many microservices. Doing so before there is load, team-ownership, or polyglot need to justify it adds network calls, duplicated cross-cutting concerns, and operational burden with no corresponding benefit — a common source of unnecessary complexity in greenfield platforms.

## Decision
Sprint 0 ships four deployable units only (`web`, `api-gateway`, `orchestrator`, `worker` — see [04-service-boundaries.md](../architecture/04-service-boundaries.md)). LLM Gateway, MCP Registry, and Notification are library packages embedded in `orchestrator`/`worker`, not services. A module is extracted into its own service only when at least one of four documented criteria is met (independent scaling need, independent release cadence/ownership, different runtime requirement, or reuse by a second host process), and the extraction itself is recorded as a new ADR.

## Consequences
- Hexagonal layering ([ADR-0002](0002-hexagonal-clean-layering.md)) is what makes later extraction cheap: a package behind a port becomes a service behind an API without its callers changing.
- Sprint 0 operational footprint stays small (four processes, not ten+), which keeps CI/CD and local dev fast.
- Requires discipline to resist extracting a service "because it feels more scalable" without evidence — this ADR is the explicit reference point when that pressure appears.

## Alternatives considered
- **Microservices from day one** (separate LLM Gateway service, separate MCP Registry service, etc.): rejected for Sprint 0 — no current scaling/ownership need, and it multiplies deployment, observability, and network-failure surface before there is a single real user.
- **Single undifferentiated monolith with no internal module boundaries**: rejected — without the ports/layering discipline, later extraction becomes a rewrite instead of an adapter swap, which is the actual failure mode this ADR is designed to avoid.

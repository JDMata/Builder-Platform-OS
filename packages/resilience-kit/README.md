# @sap-app-factory/resilience-kit

## Purpose
Generic, port-agnostic retry + timeout primitive shared by every port's resilience wrapper (`llm-core`, `mcp-core`, ...) — extracted while scaffolding SAF-10 to avoid duplicating the exact same algorithm `llm-core` had already implemented for SAF-9. See [ADR-0016](../../docs/adr/0016-mandatory-resilience-patterns.md).

## Ports
None — this package has zero port awareness by design. It's a utility, not an adapter.

## Sprint 0 scope
`retryWithBackoff()` — real, minimal, in-memory bounded retry with a per-attempt timeout. **Not yet built:** the Redis-backed, cross-replica circuit-breaker state ADR-0016 also calls for — that's SAF-27.

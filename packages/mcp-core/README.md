# @sap-app-factory/mcp-core

## Purpose
MCP Registry orchestration: wraps any `McpConnectionPort` adapter with resilience (timeout + bounded retry). See [ADR-0016](../../docs/adr/0016-mandatory-resilience-patterns.md).

## Ports
Depends on `@sap-app-factory/ports` (`McpConnectionPort`). Implements the same port by decorating a concrete adapter — application code depends on the port, never on this package directly (adapter-tier, injected at the composition root in `apps/*`).

## Sprint 0 scope
`withMcpResilience()` — real, minimal, in-memory timeout + retry, delegating the generic algorithm to `@sap-app-factory/resilience-kit` (shared with `llm-core`'s equivalent wrapper). **Not yet built:** the Redis-backed, cross-replica circuit-breaker state ADR-0016 also calls for — that's SAF-27. Capability-binding enforcement (the Zero Trust tool-access control point) is a real feature, not part of this Sprint 0 skeleton.

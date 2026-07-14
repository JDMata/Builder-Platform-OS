# @sap-app-factory/llm-core

## Purpose
LLM Gateway orchestration: wraps any `LlmProviderPort` adapter with resilience (timeout + bounded retry). See [ADR-0016](../../docs/adr/0016-mandatory-resilience-patterns.md).

## Ports
Depends on `@sap-app-factory/ports` (`LlmProviderPort`). Implements the same port by decorating a concrete adapter — application code depends on the port, never on this package directly (it's adapter-tier, injected at the composition root in `apps/*`).

## Sprint 0 scope
`withResilience()` — real, minimal, in-memory timeout + retry. **Not yet built:** the Redis-backed, cross-replica circuit-breaker/rate-limit state ADR-0016 calls for — that's SAF-27. This wrapper protects a single process; it does not yet prevent every replica from independently hammering a failing provider.

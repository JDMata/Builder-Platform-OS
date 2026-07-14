# @sap-app-factory/adapter-llm-anthropic

## Purpose
Implements `LlmProviderPort` for Anthropic. See [ADR-0005](../../../docs/adr/0005-llm-abstraction-layer.md).

## Ports
Implements `LlmProviderPort` (`@sap-app-factory/ports`).

## Sprint 0 scope
Returns a typed, deterministic mocked response — no real network call. Proven against `testing-kit`'s `llmProviderContractTests` harness, the same suite every fake adapter in `testing-kit`'s own tests already passes.

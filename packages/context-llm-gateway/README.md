# @sap-app-factory/context-llm-gateway

## Purpose
LLM Gateway bounded context — provider-agnostic model access. See [ADR-0005](../../docs/adr/0005-llm-abstraction-layer.md).

## Contents (Sprint 0 scope)
`src/domain/model-profile.ts` — the `ModelProfile` aggregate (logical name → concrete provider/model mapping). `ProviderConfig`, `PromptTemplate`, `UsageRecord`, `CostBudget` arrive with their owning feature work.

## Ports
None yet — `src/application/` (which will depend on `LlmProviderPort`) is added once a real use case needs one.

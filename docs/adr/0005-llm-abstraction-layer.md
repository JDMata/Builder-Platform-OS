# 0005 — LLM provider abstraction layer (llm-core + llm-adapters)
Status: Proposed
Date: 2026-07-14

## Context
The platform must support multiple LLM providers (Anthropic, OpenAI, Azure OpenAI, Bedrock, and eventually local/OSS models) per tenant, with cost governance and the ability to change the underlying model behind a logical name without touching workflow definitions.

## Decision
Define `ports/llm-provider.port.ts` as the only interface application/workflow code depends on for model access. `packages/llm-core` holds `ProviderConfig`, `ModelProfile` (logical name → concrete provider+model+params), `PromptTemplate`, `UsageRecord`, and `CostBudget` domain/application logic. `packages/llm-adapters/{anthropic,openai,azure-openai,bedrock}` implement the port per provider. Workflow steps reference a `ModelProfile` id (e.g., `"reasoning-large"`), never a concrete model name.

## Consequences
- Switching, A/B testing, or adding a provider is an adapter + config change, not a workflow rewrite.
- Cost governance (`CostBudget`) and usage auditing have one enforcement/collection point regardless of provider.
- Sprint 0 ships the port and one mocked adapter returning typed fake responses — no real model calls yet, per the Sprint 0 non-goals.

## Consequences (risk)
Provider-specific capabilities (e.g., a feature only one vendor's API exposes) will occasionally not fit the common port cleanly. When that happens, extend the port with an optional, feature-detected capability rather than leaking a provider-specific type into application code — tracked as an ongoing design tension, not a one-time resolution.

## Alternatives considered
- **Direct provider SDK usage in application/workflow code**: rejected — the exact lock-in and untestability this principle exists to prevent; every workflow would need to change if a model or provider changes.
- **A single "lowest common denominator" API with no per-provider adapter**: rejected — loses provider-specific optimizations (prompt caching, batching) entirely; the adapter pattern lets each adapter exploit its provider's strengths behind the same port.

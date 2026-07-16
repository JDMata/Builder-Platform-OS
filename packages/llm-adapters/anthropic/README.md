# @sap-app-factory/adapter-llm-anthropic

## Purpose
Implements `LlmProviderPort` for Anthropic. See [ADR-0005](../../../docs/adr/0005-llm-abstraction-layer.md).

## Ports
Implements `LlmProviderPort` (`@sap-app-factory/ports`).

## Sprint 1 scope (VS-1)
`complete()`/`completeStream()` make real calls to Anthropic's Messages API via `@anthropic-ai/sdk` — first exercised for real by the `structure-business-requirement` capability. Credentials are passed into the constructor, resolved by the composition root through `SecretsVaultPort` (`adapter-secrets-vault-env`'s dev-only adapter) — this adapter never reads `process.env` itself.

`embed()` remains the Sprint 0 deterministic stub, deliberately not made real: the Anthropic Messages API has no embeddings endpoint, and no Sprint 1 capability calls `embed()`. `LlmProviderPort` stays correctly shaped for adapters that do support it — this is a documented adapter limitation, not a port design flaw.

## Testing
- `request-mapping.spec.ts` — pure unit tests (model-profile resolution, system-prompt extraction, message-role mapping), no network required.
- `anthropic-llm-adapter.spec.ts` — real-API tests gated behind `SAF_TEST_ANTHROPIC_API_KEY`, mirroring `persistence-postgres/*`'s `SAF_TEST_POSTGRES_URL` convention exactly: skips cleanly with no key configured, exercised for real (including through `llm-core`'s `withResilience` wrapper and `testing-kit`'s `llmProviderContractTests`) when one is.

# @sap-app-factory/testing-kit

## Purpose

Shared test fixtures and the contract-test harness every port/adapter pair must pass — see [CODING_STANDARDS.md](../../CODING_STANDARDS.md) § Testing.

## Ports (dependency)

Depends on `@sap-app-factory/ports` for the types the contract tests are written against. Implements no port itself.

## Contents

- `createTestRequestContext()` — a `RequestContext` fixture builder for tests.
- `llmProviderContractTests(createAdapter)`, `mcpConnectionContractTests(createAdapter)`, `eventBusContractTests(createAdapter)`, `workflowEngineContractTests(createAdapter)` — each takes a factory for the adapter under test and returns a Vitest `describe` block. Any real or fake adapter behind that port must pass it.

## Rule

A new port gets its contract-test factory added here before (or in the same PR as) its first adapter — an adapter with no contract test is not considered done, per [DEFINITION_OF_DONE.md](../../DEFINITION_OF_DONE.md).

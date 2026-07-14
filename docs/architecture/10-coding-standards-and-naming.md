# 10 — Coding Standards & Naming Conventions

## Coding standards

- **TypeScript strict mode everywhere** (`strict: true`, `noUncheckedIndexedAccess: true`). `any` is banned by lint rule; use `unknown` + narrowing at boundaries.
- **Functional core, imperative shell.** `domain/*` is pure functions/classes with no I/O and no framework imports — this is what makes it unit-testable in milliseconds with zero mocks. I/O lives only in adapters.
- **Layering is enforced by `dependency-cruiser`, not code review memory.** The rules in [01-high-level-architecture.md](01-high-level-architecture.md) and [03-monorepo-and-packages.md](03-monorepo-and-packages.md) are encoded in `dependency-cruiser.config.cjs` and run in CI — a PR that makes `domain` import an adapter fails the build, not "gets flagged by a reviewer if they notice."
- **Every port has a contract test.** `testing-kit` provides a shared test suite per port (e.g., `llmProviderContractTests(adapterFactory)`) that every adapter (real or in-memory/fake) must pass — this is what keeps adapters swappable in practice, not just in theory.
- **Public APIs are documented with TSDoc**; a package with no README explaining its purpose and its port(s) does not merge (enforced by a `tools/generators` template and a CI doc-lint check — see [12](12-risks-and-technical-debt.md)).
- **Test coverage floors**, enforced in CI, not aspirational: `domain/*` ≥ 90%, `application/*` ≥ 80%, adapters ≥ 60% (adapters lean on contract tests + a thin layer of vendor-SDK glue that's acceptable to under-cover).
- **No hidden globals/singletons.** Every port implementation is constructed explicitly and passed in (constructor/factory injection) at the composition root (`apps/*`) — no service-locator pattern, so tests never need to reset module-level state.
- **Errors are typed domain errors at the domain/application boundary** (`class RequirementNotFoundError extends DomainError`), translated to transport-appropriate errors (HTTP status, GraphQL error codes) only at the adapter edge — domain code never throws or catches a framework's error type.

## Naming conventions

| Element | Convention | Example |
|---|---|---|
| Package name | `@sap-app-factory/<layer>-<context-or-vendor>` | `@sap-app-factory/adapter-llm-anthropic` |
| File name | kebab-case | `workflow-run.aggregate.ts` |
| Class / Type / Interface | PascalCase | `WorkflowRun`, `GenerationInput` |
| Port interface | PascalCase + `Port` suffix | `LlmProviderPort`, `WorkflowEnginePort` |
| Adapter class | `<Vendor><Port-without-suffix>Adapter` | `AnthropicLlmAdapter`, `PostgresOutboxAdapter` |
| Domain event type string | `<context>.<aggregate>.<event>.v<N>`, past tense | `workflow.run.completed.v1` |
| Domain event class | PascalCase, past tense, `Event` suffix | `WorkflowRunCompletedEvent` |
| Repository interface | `<Aggregate>Repository` | `WorkflowRunRepository` |
| Use case / application service | Verb phrase, `UseCase` suffix | `StartWorkflowRunUseCase` |
| DB table | snake_case, plural | `workflow_runs`, `audit_events` |
| DB schema | snake_case, matches bounded context | `llm_gateway`, `capability_registry` |
| Env var | `SAF_<SCREAMING_SNAKE>` | `SAF_POSTGRES_URL`, `SAF_ANTHROPIC_API_KEY` |
| Feature/fix branch | `feat/<ticket>-<slug>` / `fix/<ticket>-<slug>` | `feat/saf-12-plugin-sdk-contract` |
| ADR file | `NNNN-kebab-title.md`, zero-padded, sequential | `0007-event-driven-transactional-outbox.md` |

## Why this level of ceremony for Sprint 0

Naming and layering conventions cost nothing to follow when there are 20 packages and everything to lose when there are 200 and three teams. Sprint 0's `tools/generators` scaffolding exists specifically so following these conventions is the *default*, zero-effort path for whoever adds the 21st package — not something they have to remember from this document.

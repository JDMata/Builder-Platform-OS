# Coding Standards

These are the rules a PR is checked against, mechanically where possible. See [10-coding-standards-and-naming.md](docs/architecture/10-coding-standards-and-naming.md) for the original architectural rationale; this document is the day-to-day reference for anyone writing code in this repository.

## Naming conventions

| Element | Convention | Example |
|---|---|---|
| Package name | `@sap-app-factory/<layer>-<context-or-vendor>` | `@sap-app-factory/context-workflow`, `@sap-app-factory/adapter-llm-anthropic` |
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
| ADR file | `NNNN-kebab-title.md`, zero-padded, sequential | `0013-tenancy-isolation-tiering.md` |

## Folder conventions

- One package per bounded context: `packages/context-<name>/src/{domain,application}/`. Tests live alongside the code they test (`*.spec.ts` next to `*.ts`), not in a parallel `test/` tree — proximity keeps tests from silently rotting out of sync with the code.
- Ports live only in `packages/ports/`, one file per port (`<name>.port.ts`), no implementation.
- Adapters live in `packages/<vendor-family>-adapters/<vendor>/`, one adapter package per vendor.
- Plugins live in `plugins/<name>/`, structured internally however the plugin author prefers, as long as `plugin-sdk`'s contract is satisfied at the package boundary.
- Every package has a `README.md` in its root stating: what it is, which port(s) it implements or depends on, and a link to the ADR that justifies its existence if one applies. A package without this does not merge (CI-checked).
- See [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) for the full monorepo tree.

## TypeScript rules

- `strict: true` and `noUncheckedIndexedAccess: true` in every `tsconfig.json` — no exceptions per package.
- `any` is banned by lint rule. Use `unknown` and narrow it at the boundary where untyped data enters the system (HTTP body, LLM response, MCP tool output, DB row).
- Prefer `readonly` on object/array properties and function parameters wherever mutation isn't the explicit intent — most domain objects are immutable value objects or aggregates that expose intention-revealing methods rather than public setters.
- Discriminated unions over boolean flags for anything with more than one meaningfully distinct state (a `WorkflowStep`'s `kind`, a `Result`'s `ok`/`error` variant). Exhaustiveness is enforced with a `never`-typed default case, not an unchecked `else`.
- No ambient/global mutable state. No service-locator pattern — every dependency is passed in explicitly (see Dependency Injection below).
- Domain-layer code (`src/domain/**`) imports no framework and no third-party runtime package — type-only imports from third-party packages are the only exception, and even those are discouraged.
- Public package exports are explicit (an `index.ts` barrel that names what's exported) — no `export *` from internal implementation files.

## Logging

- Structured logging only, through the shared logger in `packages/observability` — never bare `console.log`/`console.error` in application code (lint-enforced; test/dev scripts are the only exception).
- Every log line carries `correlationId` and `tenantId` from the current `RequestContext` automatically via the shared logger — a log line that can't be tied back to a tenant and a request is close to useless at scale and is treated as a bug in the calling code, not the logger.
- Log levels: `error` (an operation failed and a human may need to act), `warn` (an unexpected but handled condition — e.g., a circuit breaker opened, a retry occurred), `info` (a domain-meaningful state transition — should overlap heavily with what's already captured as a domain event), `debug` (anything else useful for local development, stripped or sampled in production).
- Never log secret material, raw credentials, or full LLM prompts/responses containing customer data at `info` level or above — see [SECURITY_BASELINE.md](SECURITY_BASELINE.md).

## Error handling

- Domain and application code throws typed domain errors (`class RequirementNotFoundError extends DomainError`), never a framework's error type (no throwing an HTTP error, an ORM error, or an SDK's raw exception out of `domain/*` or `application/*`).
- Adapters translate third-party errors (a provider timeout, an ORM constraint violation) into the port's declared error type at the adapter boundary — the caller on the other side of a port never needs to know which vendor threw what.
- Only the outermost edge (an `apps/*` HTTP handler, a queue consumer) translates a domain error into a transport-appropriate response (HTTP status, GraphQL error code, job failure reason).
- Expected, recoverable conditions (validation failure, a step that legitimately can't proceed) are modeled as return values (a `Result`/discriminated-union type), not exceptions — exceptions are reserved for genuinely exceptional, unrecoverable-at-this-layer conditions.
- Every `catch` either handles the error meaningfully (retry, fallback, typed re-throw) or is not written — no empty catch blocks, no swallowed errors "just in case."

## Dependency Injection

- Constructor injection only. No service locator, no framework-magic property injection, no reaching for a global container mid-function.
- The composition root — where concrete adapters are constructed and wired to the ports application code depends on — exists only in `apps/*`. No package outside `apps/*` ever imports a concrete adapter directly.
- Ports are the injected type everywhere in `application/*`; a use case class takes `LlmProviderPort`, never `AnthropicLlmAdapter`, even if only one adapter currently exists.
- Tests construct their subject with fakes/in-memory adapters passed to the same constructor — if a class is hard to unit test without extensive mocking, that's a signal the class is depending on a concrete implementation instead of a port, not a signal to add more mocks.

## Testing

- Test pyramid: fast, mock-free domain unit tests (majority of tests) → application-layer tests against in-memory port fakes → shared contract tests run against every real adapter for a given port → a thin layer of end-to-end tests (Playwright, for `web`) and integration tests (ephemeral docker-compose) covering the handful of flows that matter most.
- Coverage floors, enforced in CI: `domain/*` ≥ 90%, `application/*` ≥ 80%, adapters ≥ 60% (adapters lean on contract tests; the uncovered remainder is thin vendor-SDK glue).
- Every port ships a shared contract test suite in `testing-kit`; every adapter for that port — real or fake — must pass it. This is what keeps adapters actually swappable, not swappable in theory only.
- Tests are deterministic and hermetic: no reliance on wall-clock time without an injected clock, no reliance on network access, no shared mutable state between tests (parallel-safe by construction).
- A bug fix ships with a regression test that fails before the fix and passes after — no "trust me, I checked manually" fixes for anything beyond a trivial typo.

## Comments

- Default to no comments. Well-named identifiers and small, single-purpose functions should make the *what* obvious without narration.
- Write a comment only when it captures a *why* that isn't derivable from the code: a non-obvious constraint, a workaround for a specific external bug (link the issue), an invariant a reader could otherwise violate by "simplifying" the code.
- Never leave commented-out code in a merged PR — git history is where deleted code lives, not a comment block.
- No comments that restate the code (`// increment counter` above `counter++`) and no comments that reference a ticket/PR number as their only content — link to the ADR or leave the reasoning in the commit message instead, since ticket trackers rot and the code outlives them.

## Documentation

- Public APIs (exported functions/classes/types from a package's `index.ts`) carry TSDoc — enough for a consumer to use the API correctly without reading its implementation.
- Every package has a README (see Folder conventions above).
- Every cross-cutting or hard-to-reverse decision gets an ADR before, not after, the implementing PR merges — see [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md) and [docs/adr/README.md](docs/adr/README.md).
- Documentation is written and updated in the same PR as the code it describes. A PR that changes behavior a README/ADR describes and doesn't update that document is incomplete, not "documentation debt to clean up later" — see [DEFINITION_OF_DONE.md](DEFINITION_OF_DONE.md).

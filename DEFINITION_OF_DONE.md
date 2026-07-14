# Definition of Done

A story, task, or PR is **done** only when every applicable item below is true. "Applicable" matters — a docs-only change doesn't need a coverage-floor check, a pure-refactor doesn't need a new ADR — but skipping an applicable item is not a judgment call for the implementer alone; it's a review-time conversation. When in doubt, treat the item as applicable.

## Code

- [ ] Implements the acceptance criteria from the story, no more and no less (no undiscussed scope added, no partial implementation left half-finished).
- [ ] Follows [CODING_STANDARDS.md](CODING_STANDARDS.md): naming, folder placement, TypeScript rules, logging, error handling, DI pattern.
- [ ] Introduces no violation of [ARCHITECTURE_PRINCIPLES.md](ARCHITECTURE_PRINCIPLES.md) — layering, dependency direction, plugin/port boundaries all hold, verified by `dependency-cruiser`, not just by eye.
- [ ] No `TODO` without a linked ticket; no commented-out code; no debug logging left at `info` level or above.

## Tests

- [ ] New/changed domain logic has unit tests; coverage floors from [CODING_STANDARDS.md](CODING_STANDARDS.md) are met for every layer touched.
- [ ] A bug fix includes a regression test that fails without the fix and passes with it.
- [ ] A new or changed port/adapter pair passes the shared contract test suite in `testing-kit`.
- [ ] Integration/E2E tests updated if the change affects a user-facing flow or a cross-process interaction.
- [ ] All tests pass locally and in CI — no `skip`/`only` left in test files.

## Quality gates (CI, all green)

- [ ] Lint, typecheck, `dependency-cruiser`, unit tests, contract tests, build.
- [ ] Security scan (dependency audit, secret scan, SAST) clean, or findings explicitly triaged and accepted with a documented reason per [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md).
- [ ] No fitness function was weakened, disabled, or bypassed to make the pipeline pass.

## Documentation

- [ ] Every package touched still has an accurate README (purpose, ports implemented/depended on).
- [ ] Public APIs carry TSDoc.
- [ ] An ADR exists and is `Accepted` for any cross-cutting or hard-to-reverse decision introduced by this change — written before merge, not promised for later (see [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md)).
- [ ] Any architecture doc under [docs/architecture/](docs/architecture/) that this change makes inaccurate is updated in the same PR.

## Security & compliance

- [ ] No secret, credential, or customer PII introduced into logs, error messages, LLM prompts sent to a third party, or version control.
- [ ] Authorization checks added for any new resource/action, expressed as policy (OPA/Cedar), not inline role checks.
- [ ] `RequestContext` (tenant, actor, correlation ID) threaded through any new port call.
- [ ] Threat-modeled against [SECURITY_BASELINE.md](SECURITY_BASELINE.md) if the change touches auth, secrets, plugin execution, or data crossing a tenant boundary.

## Observability

- [ ] New port invocations, workflow steps, or plugin executions emit OpenTelemetry spans via the shared instrumentation helpers — not ad hoc, not skipped.
- [ ] Relevant domain events are emitted for any new domain-meaningful state transition, via the transactional outbox.

## Review & delivery

- [ ] At least one approval from someone other than the author; any port/adapter-interface change reviewed by someone representing its consumers, per [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md).
- [ ] All blocking review comments resolved.
- [ ] Deployed to `dev` and manually verified against the acceptance criteria (not just "tests pass") before the story is closed.
- [ ] No known regression introduced in an adjacent feature — checked, not assumed.

A story that meets every applicable box above but whose acceptance criteria were themselves wrong or incomplete is not "done despite the spec" — that's a signal the story shouldn't have passed [DEFINITION_OF_READY.md](DEFINITION_OF_READY.md) in the first place, and is fed back into that process.

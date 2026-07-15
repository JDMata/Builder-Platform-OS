## What & why

<!-- One or two sentences: what changed and the reason, not a restatement of the diff. -->

## Ticket

<!-- SAF-### — link to the backlog item, or explain why this PR has none. -->

## `needs-adr`

- [ ] **Yes** — this PR introduces a cross-cutting or hard-to-reverse decision. Link the ADR: <!-- docs/adr/00XX-....md -->
- [ ] **No** — and here's why it doesn't need one: <!-- reason, not left blank -->

Leaving both boxes unchecked is not a valid answer — see [TECHNICAL_DEBT_POLICY.md](../TECHNICAL_DEBT_POLICY.md) and [12-risks-and-technical-debt.md](../docs/architecture/12-risks-and-technical-debt.md)'s "ADR required for cross-cutting decisions" fitness function.

## Definition of Done

<!-- Full checklist: DEFINITION_OF_DONE.md. Check only what's applicable to this PR; explain anything you're intentionally skipping. -->

- [ ] Code: follows CODING_STANDARDS.md; no ARCHITECTURE_PRINCIPLES.md violation (verified by `dependency-cruiser`, not just by eye); no stray `TODO`/commented-out code/debug logging.
- [ ] Tests: new/changed logic covered; a bug fix has a regression test; any new/changed port-adapter pair passes its `testing-kit` contract suite; no `skip`/`only` left in test files.
- [ ] Quality gates: lint, typecheck, `dependency-cruiser`, unit + contract tests, build all green in CI; no fitness function weakened or bypassed to get there.
- [ ] Documentation: every touched package's README is still accurate (Purpose + Ports); any architecture doc this change makes inaccurate is updated in this same PR.
- [ ] Security: no secret/credential/PII in logs, errors, prompts, or version control; new resource/action has an authorization check expressed as policy, not an inline role check; `RequestContext` threaded through any new port call.
- [ ] Observability: new port invocations/workflow steps/plugin executions emit spans via the shared instrumentation helpers; new domain-meaningful state transitions publish an event via the outbox.

## How to verify

<!-- Exact commands/steps a reviewer can run to see this work for themselves — not "trust the tests." -->

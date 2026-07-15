# Sprint 1 Test Strategy

Per the Engineering Planning Principles: no Vertical Slice is complete without automated validation covering unit, contract, and end-to-end proof — a manual demo is evidence of a working *build*, never a substitute for a passing automated suite. Follows the same layered discipline [PROJECT_PLAYBOOK.md](../../../PROJECT_PLAYBOOK.md)'s Testing Strategy already establishes platform-wide.

## VS-1 — Capture and Structure a Business Idea

| Test layer | What's verified | Owning task(s) |
|---|---|---|
| **Unit tests** | `RequirementDocument`/`Requirement`/`Clarification`/`AcceptanceCriterion` domain invariants (empty idea text rejected, clarification-answer transitions, etc.), zero mocks, milliseconds to run. | 1.3 |
| **Integration tests** | `persistence-postgres/requirements` repositories against a real Postgres instance (tenant isolation, round-trip persistence). | 1.4 |
| **Contract tests** | `testing-kit`'s `repositoryContractTests` (Task 1.4); `llmProviderContractTests` re-run against the real Anthropic call, not just the mock (Task 1.5); a **new** `CapabilityResolverPort` contract-test suite, mirroring the pattern every existing port already has (Task 1.7). | 1.4, 1.5, 1.7 |
| **Workflow tests** | The Discovery `WorkflowDefinition`'s intake portion transitions correctly (`pending → running → awaiting_approval → running`, repeating on further clarification rounds); every transition emits the expected `workflow.run.*`/`workflow.step.completed.v1` events, verified against a real subscriber. | 1.12 |
| **Capability tests** | `structure-business-requirement` produces ≥1 `Requirement` from realistic idea text; a deliberately ambiguous input produces a `Clarification`, never a guessed requirement (the agent's own Escalation rule, verified, not assumed); an env-gated real-provider suite (mirroring SAF-11's `SAF_TEST_POSTGRES_URL` pattern) plus a deliberately-adversarial input that verifies the clarification loop's round bound (Risk #7/#13 in [04-risk-register.md](04-risk-register.md)). | 1.6, 1.10 |
| **UI tests** | Login redirect flow; idea-submission form validation and confirmation state; clarification screen renders every unanswered `Clarification` with its quoted source context; accessibility assertions (labelled inputs, not placeholder-only). | 1.1, 1.9, 1.11 |
| **End-to-end tests** | Not this slice's own — VS-1's full path is proven as part of VS-2's Task 2.6 (the sprint's single end-to-end demo covers both slices together, since VS-1 alone has no terminal business outcome without VS-2's approval). | 2.6 |
| **Acceptance validation** | Every acceptance criterion listed in [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md)'s VS-1 table, checked explicitly at the Sprint Exit Gate, not inferred from "tests pass." | All VS-1 tasks |

## VS-2 — Approve Discovery into an Approved Project

| Test layer | What's verified | Owning task(s) |
|---|---|---|
| **Unit tests** | `Project` domain invariants (creatable only from an approved `RequirementDocument` reference), zero mocks. | 2.1 |
| **Integration tests** | `persistence-postgres/project` against a real Postgres instance (tenant isolation, no cross-schema foreign key into Requirements Intake's tables). | 2.2 |
| **Contract tests** | `testing-kit`'s `repositoryContractTests` for the new `Project` repository. | 2.2 |
| **Workflow tests** | The Discovery `WorkflowDefinition`'s completion portion transitions `awaiting_approval → running → completed`; `workflow.run.completed.v1` emitted. | 2.4 |
| **Capability tests** | None new — Task 2.3 (approval) is explicitly not a Capability (see [10-capability-model-review.md](../../governance/sprint-1-product-design-review/10-capability-model-review.md)); its correctness is verified as a plain use-case test, not a capability contract test. | 2.3 |
| **UI tests** | Review screen shows every requirement/acceptance-criterion with a confidence badge; approve action disabled while any `Clarification` is unanswered (both client-side and, critically, re-verified server-side); Project Ready screen renders the created `Project` and the "what happens next" panel. | 2.5, 2.7 |
| **End-to-end tests** | **The sprint's one required end-to-end proof:** idea submission (VS-1) through `Project` creation (VS-2), against real adapters — real LLM call, real capability resolution, real persistence, real event emission — not mocks at any layer. Runs unattended via `pnpm run demo:sprint1`. | 2.6 |
| **Acceptance validation** | Every acceptance criterion listed in [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md)'s VS-2 table, checked at the Sprint Exit Gate. | All VS-2 tasks |

## Standing rule for both slices

**No Vertical Slice is marked complete on the strength of its end-to-end demo alone, and no Vertical Slice is marked complete on unit/contract tests alone without the end-to-end demo.** Both are required — the layered strategy exists because each layer catches a different class of defect the others don't (a unit test can't catch a real Anthropic API contract mismatch; an end-to-end demo run once by hand can't catch a tenant-isolation regression introduced next sprint). This mirrors exactly the testing discipline `tools/sprint0-demo` already established for Sprint 0, extended, not reinvented, for Sprint 1.

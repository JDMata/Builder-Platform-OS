# Sprint 1 Test Strategy

**Revised 2026-07-17** for the corrected, PDR-synchronized task numbering. No Vertical Slice is complete without automated validation covering unit, contract, and end-to-end proof. Follows [PROJECT_PLAYBOOK.md](../../../PROJECT_PLAYBOOK.md)'s Testing Strategy.

## VS-1 — Discovery Workspace

| Test layer | What's verified | Owning task(s) |
|---|---|---|
| **Unit tests** | `RequirementDocument`/`Requirement`/`Clarification`/`AcceptanceCriterion` domain invariants; `Project` domain invariants (its original, approved shape — `id`, `workspaceId`, `name`, `description`, `sourceRequirementDocumentId` only) — zero mocks. | 1.3, 1.12 |
| **Integration tests** | `persistence-postgres/requirements` and `persistence-postgres/project` against a real Postgres instance (tenant isolation, round-trip persistence, no cross-schema foreign keys). | 1.4, 1.13 |
| **Contract tests** | `repositoryContractTests` (1.4, 1.13); `llmProviderContractTests` against the real Anthropic call (1.5); a **new** `CapabilityResolverPort` contract-test suite (1.7). | 1.4, 1.5, 1.7, 1.13 |
| **Workflow tests** | The full Discovery `WorkflowDefinition` transitions correctly end to end — `pending → running → awaiting_approval → running → ... → awaiting_approval → completed`; every transition emits the expected events, verified against a real subscriber. | 1.16 |
| **Capability tests** | `structure-business-requirement` produces ≥1 `Requirement` and a suggested `Project` name from realistic idea text; ambiguous input produces a `Clarification`, never a guess; an env-gated real-provider suite (mirroring SAF-11's pattern); a deliberately-adversarial input verifying the clarification loop's round bound. | 1.6, 1.10 |
| **UI tests** | Login redirect flow; idea-submission form validation and confirmation state; clarification screen's quoted context and accessibility; Project Charter screen's confidence badges and gating; Project Ready screen's real-data rendering and "what happens next" panel. | 1.1, 1.9, 1.11, 1.15, 1.17 |
| **End-to-end tests** | **The sprint's one required end-to-end proof:** login through Project Ready, against real adapters at every layer (real LLM call, real capability resolution, real persistence, real event emission). Runs unattended via `pnpm run demo:sprint1`. | 1.18 |
| **Acceptance validation** | Every acceptance criterion in [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md)'s VS-1 and per-task tables, checked explicitly at the Sprint Exit Gate. | All tasks |

No Digital Twin test layer is defined this sprint — `context-digital-twin` remains untouched, Sprint 7 scope, per the Product Design Review's own position.

## Standing rule (unchanged)

**No Vertical Slice is marked complete on the strength of its end-to-end demo alone, and no Vertical Slice is marked complete on unit/contract tests alone without the end-to-end demo.** Both are required.

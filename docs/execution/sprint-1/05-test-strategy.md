# Sprint 1 Test Strategy

**Revised 2026-07-16** for the merged, single-slice structure. No Vertical Slice is complete without automated validation covering unit, contract, and end-to-end proof — a manual demo is evidence of a working *build*, never a substitute. Follows [PROJECT_PLAYBOOK.md](../../../PROJECT_PLAYBOOK.md)'s Testing Strategy.

## VS-1 — Discovery Workspace

| Test layer | What's verified | Owning task(s) |
|---|---|---|
| **Unit tests** | `RequirementDocument`/`Requirement`/`Clarification`/`AcceptanceCriterion` domain invariants; `Project` domain invariants (including `projectType` never validated against a hardcoded Kernel-side list); `DigitalTwinNode`/`DigitalTwinEdge`/`NodeTypeDefinition`/`RelationshipTypeDefinition` invariants — all zero mocks. | 1.3, 1.13, 1.17 |
| **Integration tests** | `persistence-postgres/requirements` and `persistence-postgres/project` against a real Postgres instance (tenant isolation, round-trip persistence, no cross-schema foreign keys). | 1.4, 1.14 |
| **Contract tests** | `repositoryContractTests` (1.4, 1.14); `llmProviderContractTests` against the real Anthropic call (1.5); a **new** `CapabilityResolverPort` contract-test suite (1.7); a **new** `GraphStorePort` contract-test suite (1.18), mirroring the pattern every existing port already has. | 1.4, 1.5, 1.7, 1.14, 1.18 |
| **Workflow tests** | The full Discovery `WorkflowDefinition` transitions correctly end to end — `pending → running → awaiting_approval → running → ... → awaiting_approval → running → completed` — including the Digital Twin update, audit, and telemetry steps; every transition emits the expected events, verified against a real subscriber. | 1.20 |
| **Capability tests** | `structure-business-requirement` produces ≥1 `Requirement` from realistic idea text; ambiguous input produces a `Clarification`, never a guess; an env-gated real-provider suite (mirroring SAF-11's pattern); a deliberately-adversarial input verifying the clarification loop's round bound. | 1.6, 1.11 |
| **Digital Twin tests** (new test layer this revision) | A successful confirmation (Task 1.15) produces exactly the expected `Project`/`Platform`/`ProjectType`/`Owner`/`CreationEvent` nodes and their relationships, matching [ADR-0021](../../adr/0021-project-digital-twin-knowledge-graph.md)'s model exactly; a **failed** confirmation writes zero Digital Twin nodes (no partial graph state); a query against the written graph returns a correct, traceable result — the first real exercise of what [16-project-digital-twin.md](../../architecture/16-project-digital-twin.md) promises. | 1.17, 1.18, 1.19 |
| **UI tests** | Login redirect flow; Dashboard empty-state rendering; Start New Project form validation (including the Project Type dropdown's values coming from Platform Pack data, not hardcoded UI copy); Clarification screen's quoted context and accessibility; User Confirmation screen's confidence badges and gating; Initial Project Workspace's real-data rendering. | 1.1, 1.9, 1.10, 1.12, 1.16, 1.21 |
| **End-to-end tests** | **The sprint's one required end-to-end proof:** login through Initial Project Workspace, against real adapters at every layer (real LLM call, real capability resolution, real persistence, real Digital Twin writes, real event emission). Runs unattended via `pnpm run demo:sprint1`. | 1.22 |
| **Acceptance validation** | Every acceptance criterion in [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md)'s VS-1 table and per-task table, checked explicitly at the Sprint Exit Gate, not inferred from "tests pass." | All tasks |

## Standing rule (unchanged)

**No Vertical Slice is marked complete on the strength of its end-to-end demo alone, and no Vertical Slice is marked complete on unit/contract tests alone without the end-to-end demo.** Both are required — this now applies to a single, larger slice rather than two smaller ones, but the discipline itself doesn't change with scale.

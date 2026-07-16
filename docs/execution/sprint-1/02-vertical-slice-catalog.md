# Sprint 1 Vertical Slice Catalog

**Revised 2026-07-17** — synchronized with the approved Product Design Review ([01-sprint-1-backlog.md](01-sprint-1-backlog.md)'s inconsistency table). One slice, 19 engineering tasks (down from 23 — Dashboard and the Digital Twin pull-forward tasks removed, Project domain/persistence simplified, the two workflow-portion tasks unified into one). T-shirt-sized effort (S/M/L/XL).

---

## VS-1 — Discovery Workspace

| Field | Detail |
|---|---|
| **Identifier** | VS-1 |
| **Title** | Discovery Workspace |
| **Business objective** | Let a user turn a business idea into an approved, durable `Project` through one continuous, AI-guided experience — exactly the journey the Product Design Review validated. |
| **User journey** | Login → Idea submission → (loop: Clarification Q&A) → Project Charter (review & confirm) → Project Ready. Matches [01-user-journey-and-screen-evaluations.md](../../governance/sprint-1-product-design-review/01-user-journey-and-screen-evaluations.md) exactly — no Dashboard, no Project Type step. |
| **Screens involved** | Login, Idea Submission, Clarification Q&A, Project Charter (Review & Confirm), Project Ready. |
| **Capabilities executed** | `structure-business-requirement`, resolved via `CapabilityResolverPort`'s first real adapter. |
| **Workflow executed** | The Discovery `WorkflowDefinition`, one continuous run: `capture-idea` → `capability-request(structure-business-requirement)` → conditional clarification loop → `human-approval` (confirmation) → `create-project`. Transitions `pending → running → awaiting_approval → running → ... → awaiting_approval → completed`. |
| **Platform events** | `workflow.run.started.v1`, `workflow.step.completed.v1` (per step), `requirements.document.captured.v1` (first real emission), `workflow.run.completed.v1`. |
| **Generated artifacts** | `RequirementDocument`, `Requirement`, `Clarification`, `AcceptanceCriterion`, `Project` (`id`, `workspaceId`, `name` — agent-derived, `description`, `sourceRequirementDocumentId`; no `projectType`/`businessArea`/`customer`/`country` — none of these were ever approved). |
| **Digital Twin nodes affected** | None written — `context-digital-twin` doesn't exist yet (Sprint 7). Satisfied by the interim traceability standard: every artifact above is a real, persisted, ID-referenceable row, and every structuring pass is a recorded `AgentInvocation`, per the Engineering Planning Principles and the PDR's own [Project Workspace Review](../../governance/sprint-1-product-design-review/06-project-workspace-review.md). |
| **Repositories affected** | `RequirementDocumentRepository`, `RequirementRepository`, `ClarificationRepository`, `AcceptanceCriterionRepository` (`persistence-postgres/requirements`); `ProjectRepository` (`persistence-postgres/project`). |
| **Packages affected** | `context-requirements`, `persistence-postgres/requirements` (new), `llm-adapters/anthropic`, `context-capability-registry`, `context-project` (new `Project` aggregate), `persistence-postgres/project` (new), `workflow-engine-adapters/in-memory` (new workflow definition). |
| **Applications affected** | `apps/web` (5 screens), `apps/api-gateway` (new routes), `apps/orchestrator` (workflow definition), `apps/worker` (if structuring runs as a background job — confirmed at implementation time). |
| **Acceptance criteria** | A user reaches idea submission only after authenticating, with no dashboard in between; submitting non-empty idea text produces a draft `RequirementDocument`; structuring runs against a real Anthropic call; every `Clarification` is answerable and re-triggers structuring; confirmation is blocked while any `Clarification` is outstanding; confirming creates exactly one `Project` with an agent-derived name. |
| **Definition of Done** | [DEFINITION_OF_DONE.md](../../../DEFINITION_OF_DONE.md) plus the Engineering Planning Principles' "every completed feature must" list — Digital Twin requirement satisfied via the interim standard, as originally specified. |
| **Testing requirements** | [05-test-strategy.md](05-test-strategy.md). |
| **Telemetry requirements** | OTel spans/structured logs for: idea submission, each structuring invocation, each clarification answer, confirmation attempts, Project creation, event emission. |
| **Audit requirements** | Every `AgentInvocation` (structuring pass); the confirmation action itself as an `AuditEvent` (Governance context). |
| **Documentation requirements** | Package READMEs for `persistence-postgres/requirements` and `persistence-postgres/project` (both new); [02-domain-model.md](../../architecture/02-domain-model.md) updated to confirm `RequirementDocument`/`Clarification`/`AcceptanceCriterion`/`Project` are now implemented — no Digital Twin doc changes needed, since nothing there is touched. |
| **Estimated effort** | **L** — smaller than the prior (incorrect) XL estimate, since the Digital Twin and Dashboard scope that inflated it is removed. |
| **Risk assessment** | [04-risk-register.md](04-risk-register.md). |
| **Business value** | The platform's first real demonstration of "AI-guided discovery" — Sprint 1's most distinctive claim, delivered exactly as the Product Design Review validated it. |
| **Demonstration scenario** | [06-demonstration-plan.md](06-demonstration-plan.md). |
| **Implementation dependencies** | None beyond the Sprint 0 baseline. |
| **Independent deployability** | Yes — this is Sprint 1's entire deliverable. |

---

## Engineering Tasks

| Task | Purpose | Owner type | FE | BE | Workflow | AI | Docs | Testing | DevOps | Dependencies | Acceptance criteria | Effort |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **1.1** | Login screen wired to the existing OIDC redirect flow (Quick Win #2). | Frontend Engineer | ✓ | | | | | ✓ | | None. | User can reach and complete sign-in; redirects correctly. | S |
| **1.2** | Fix the `drizzle-orm` CVE across all `persistence-postgres/*` packages. | Backend Engineer | | ✓ | | | | ✓ | ✓ | None. | Full regression passes; vulnerability closed. | M |
| **1.3** | `context-requirements` domain: `RequirementDocument`, `Clarification`, `AcceptanceCriterion` — Workspace-scoped (corrected SAF-41 wording). | Backend Engineer | | ✓ | | | ✓ | ✓ | | None. | Unit tests, zero mocks, cover every invariant. | M |
| **1.4** | `persistence-postgres/requirements` repositories. | Backend Engineer | | ✓ | | | ✓ | ✓ | | 1.2, 1.3. | Passes `repositoryContractTests`, including tenant isolation. | M |
| **1.5** | Real Anthropic API call behind `LlmProviderPort`. | Backend Engineer | | ✓ | | ✓ | | ✓ | ✓ | None. | Passes `llmProviderContractTests` against the real call; resilience verified; credentials via `SecretsVaultPort`. | M |
| **1.6** | Real `requirements-analyst` capability: prompt, structuring logic (including deriving a suggested `Project` name), ≥1 AI-suggested acceptance criterion (Quick Win #5). | AI/Backend Engineer | | | | ✓ | ✓ | ✓ | ✓ | 1.3, 1.5. | Produces ≥1 `Requirement` and a suggested name; low-confidence input produces a `Clarification`; every invocation recorded. | L |
| **1.7** | `CapabilityResolverPort`'s first real adapter. | Backend Engineer | | ✓ | ✓ | | | ✓ | ✓ | 1.6. | Passes a new shared contract-test suite; unregistered capability fails clearly. | M |
| **1.8** | `SubmitBusinessIdea` use case — idea text + Workspace reference only. | Backend Engineer | | ✓ | | | | ✓ | | 1.3, 1.4. | Draft `RequirementDocument` persisted; empty idea text rejected. | S |
| **1.9** | Idea submission UI + accessibility fix (real `<label>`, not placeholder-only) (Quick Win #9 part). | Frontend Engineer | ✓ | | | | | ✓ | ✓ | 1.1, 1.8. | A user can submit an idea directly after login (no dashboard step); labelled per accessibility requirements. | M |
| **1.10** | `AnswerClarification` use case. | Backend Engineer | | ✓ | | | | ✓ | | 1.8, 1.6. | Answering resolves the `Clarification` and triggers exactly one re-structuring pass; no duplicate questions. | M |
| **1.11** | Clarification Q&A UI — quoted source-idea context (Quick Win #3), staged progress messaging (Quick Win #4), labelled inputs (Quick Win #9 part). | Frontend Engineer | ✓ | | | | | ✓ | ✓ | 1.10. | Every unanswered `Clarification` shown with its triggering fragment quoted; accessible. | L |
| **1.12** | `context-project` domain: `Project` aggregate — `id`, `workspaceId`, `name`, `description`, `sourceRequirementDocumentId`. No `projectType`/`businessArea`/`customer`/`country`. | Backend Engineer | | ✓ | | | ✓ | ✓ | | None. | Creatable only from an approved `RequirementDocument` reference; unit-tested, zero mocks. | S |
| **1.13** | `persistence-postgres/project` repository. | Backend Engineer | | ✓ | | | ✓ | ✓ | | 1.2, 1.12. | Passes tenant-isolation contract tests; no cross-schema foreign key into Requirements Intake's tables. | M |
| **1.14** | `ApproveRequirementDocument` use case — confirmation gating, `Project` creation (using the agent-derived name), `requirements.document.captured.v1` emission. | Backend Engineer | | ✓ | | | | ✓ | | 1.8, 1.13. | Rejects confirmation with any unanswered `Clarification`; creates exactly one `Project`; event verifiably in the outbox. | M |
| **1.15** | Project Charter UI (Quick Win #6 framing) with derived confidence badges (Quick Win #8) and structured, labelled headings (Quick Win #9 part). | Frontend Engineer | ✓ | | | | | ✓ | ✓ | 1.14. | Shows every requirement + acceptance criteria with a confidence badge; confirm disabled while clarifications outstanding; screen-reader-navigable. | L |
| **1.16** | Discovery `WorkflowDefinition`, full: intake → structuring → clarification loop → confirmation → Project creation. | Backend/Workflow Engineer | | ✓ | ✓ | | | ✓ | ✓ | 1.7, 1.10, 1.14. | Full run transitions correctly end to end; every transition emits the expected events. | M |
| **1.17** | Project Ready confirmation screen with a "what happens next" panel (Quick Win #7). | Frontend Engineer | ✓ | | | | | ✓ | ✓ | 1.14. | Confirms the created `Project` with real data; static panel previews future capabilities without implying they exist today. | S |
| **1.18** | End-to-end vertical-slice demo: login through Project Ready, against real adapters. | QA/Backend Engineer | | ✓ | ✓ | | ✓ | ✓ | | Every prior task. | `pnpm run demo:sprint1` runs unattended; produces a real, inspectable `Project` row and outbox event. | M |
| **1.19** | First real GitHub Actions CI run. | DevOps Engineer | | | | | | ✓ | | ✓ | Push authorized (user's call). | CI executes successfully on a real runner for the first time. | S |

## Traceability to original SAF tickets

SAF-39→1.3, SAF-40→1.4, SAF-41→1.8, SAF-42→1.9, SAF-43→1.5, SAF-44→1.6, SAF-45→1.7, SAF-46→1.10, SAF-47→1.11, SAF-48→1.12, SAF-49→1.13, SAF-50→1.14, SAF-51→1.15, SAF-52→1.16, SAF-53→1.18, SAF-54→1.2, SAF-55→1.19. **SAF-57, SAF-58, SAF-59, SAF-60 (Dashboard, rich project fields, Digital Twin integration, "Initial Project Workspace") are removed** — none was approved by the Product Design Review; see [docs/backlog/sprint-1-backlog.md](../../backlog/sprint-1-backlog.md) for the corresponding backlog correction. **SAF-34/SAF-35 (Digital Twin domain + `GraphStorePort` adapter) revert fully to Sprint 7**, no longer pulled forward.

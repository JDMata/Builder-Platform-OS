# Sprint 1 Vertical Slice Catalog

**Revised 2026-07-16** — VS-1 and VS-2 merged into one Vertical Slice per the updated product decision recorded in [01-sprint-1-backlog.md](01-sprint-1-backlog.md). One slice, 23 engineering tasks, T-shirt-sized effort (S/M/L/XL — no fabricated hour/point estimates).

---

## VS-1 — Discovery Workspace

| Field | Detail |
|---|---|
| **Identifier** | VS-1 |
| **Title** | Discovery Workspace |
| **Business objective** | Validate the complete enterprise platform through one small, real business capability: a user turns an idea into an approved, durable `Project`. |
| **User journey** | Login → Dashboard → Start New Project (idea + project-identifying fields + project type) → AI Discovery Workshop (adaptive questioning, requirement refinement, confidence) → User Confirmation → Project Creation → Initial Project Workspace. |
| **Screens involved** | Login, Dashboard, Start New Project, Clarification Q&A, User Confirmation ("Project Charter"), Initial Project Workspace. |
| **Capabilities executed** | `structure-business-requirement`, resolved via `CapabilityResolverPort`'s first real adapter. Project creation remains a use case, not a Capability. |
| **Workflow executed** | The Discovery `WorkflowDefinition`, now end to end in one run: `capture-idea` → `capability-request(structure-business-requirement)` → conditional clarification loop → `human-approval` (user confirmation) → `create-project` → `update-digital-twin` → `register-audit-event` → `emit-telemetry`. Transitions `pending → running → awaiting_approval → running → ... → awaiting_approval → running → completed`. |
| **Platform events** | `workflow.run.started.v1`, `workflow.step.completed.v1` (per step), `requirements.document.captured.v1` (first real emission), `workflow.run.completed.v1`. If validation fails: a `requirements.document.rejected.v1`-shaped failure event, following the same versioned, past-tense convention as every other event (added only if a real validation-failure path needs it — see Task 1.15). |
| **Generated artifacts** | `RequirementDocument`, `Requirement`, `Clarification`, `AcceptanceCriterion`, `Project`, `DigitalTwinNode`/`DigitalTwinEdge` records. |
| **Digital Twin nodes affected** | New, real: `Project`, `Platform` (value: `sap`), `ProjectType` (opaque, Platform-Pack-supplied value), `Owner` (the creating user), `CreationEvent`/`CreationTimestamp`. Relationships per [ADR-0021](../../adr/0021-project-digital-twin-knowledge-graph.md)'s already-approved node/edge model — no new relationship types invented. |
| **Repositories affected** | `RequirementDocumentRepository`, `RequirementRepository`, `ClarificationRepository`, `AcceptanceCriterionRepository` (all `persistence-postgres/requirements`); `ProjectRepository` (`persistence-postgres/project`); a new `DigitalTwinNodeRepository`/`DigitalTwinEdgeRepository` (via the first real `GraphStorePort` adapter). |
| **Packages affected** | `context-requirements`, `persistence-postgres/requirements` (new), `llm-adapters/anthropic`, `context-capability-registry`, `context-project` (new `Project` aggregate), `persistence-postgres/project` (new), `context-digital-twin` (new — minimal), a new `GraphStorePort` adapter package, `workflow-engine-adapters/in-memory` (new workflow definition). |
| **Applications affected** | `apps/web` (all 6 screens), `apps/api-gateway` (new routes), `apps/orchestrator` (workflow definition + Digital Twin write step), `apps/worker` (if structuring runs as a background job — confirmed at implementation time). |
| **Acceptance criteria** | A user reaches Dashboard only after authenticating; Dashboard's only action is Start New Project; the start form captures Project Name, Business Area, Customer, Country, Project Type, and the free-text idea, scoped to a `Workspace`; AI structuring runs against a real Anthropic call; every `Clarification` is answerable and re-triggers structuring; confirmation is blocked while any `Clarification` is outstanding; confirming creates exactly one `Project` and writes exactly one coherent set of Digital Twin nodes/edges; the Initial Project Workspace shows the real created `Project`. |
| **Definition of Done** | [DEFINITION_OF_DONE.md](../../../DEFINITION_OF_DONE.md) plus the Engineering Planning Principles' "every completed feature must" list, in full — including, now, a **real** Digital Twin update (no longer satisfied by the interim traceability standard, since this slice builds the real mechanism). |
| **Testing requirements** | [05-test-strategy.md](05-test-strategy.md). |
| **Telemetry requirements** | OTel spans/structured logs for: idea/project-detail submission, each structuring invocation, each clarification answer, confirmation attempts (including rejected ones), Project creation, Digital Twin writes, event emission. |
| **Audit requirements** | Every `AgentInvocation` (structuring pass); the confirmation/approval action itself as an `AuditEvent` (Governance context) — a human decision with real consequences, always audit-logged, per the Governance context's existing design. |
| **Documentation requirements** | Package READMEs for `persistence-postgres/requirements`, `persistence-postgres/project`, `context-digital-twin`, and the new `GraphStorePort` adapter (all new); updates to [02-domain-model.md](../../architecture/02-domain-model.md) and [16-project-digital-twin.md](../../architecture/16-project-digital-twin.md) confirming what's now implemented vs. still Sprint-7-scoped; `PROJECT_CONTEXT.md` updated at slice close. |
| **Estimated effort** | **XL** — the sprint's only Vertical Slice, carrying every risk the former two slices carried plus the Digital Twin pull-forward. |
| **Risk assessment** | [04-risk-register.md](04-risk-register.md). |
| **Business value** | The literal "idea to approved project" promise in the Sprint 1 mission, now proven against every platform layer at once — the strongest possible single demonstration of the platform's real capability. |
| **Demonstration scenario** | [06-demonstration-plan.md](06-demonstration-plan.md). |
| **Implementation dependencies** | None beyond the Sprint 0 baseline. |
| **Independent deployability** | Yes — this is now Sprint 1's entire deliverable; there is no smaller independently-deployable unit within it that would still satisfy the Sprint 1 mission on its own. |

---

## Engineering Tasks

| Task | Purpose | Owner type | FE | BE | Workflow | AI | Docs | Testing | DevOps | Dependencies | Acceptance criteria | Effort |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **1.1** | Login screen wired to the existing OIDC redirect flow. | Frontend Engineer | ✓ | | | | | ✓ | | None. | User can reach and complete sign-in; redirects correctly. | S |
| **1.2** | Fix the `drizzle-orm` CVE across all `persistence-postgres/*` packages. | Backend Engineer | | ✓ | | | | ✓ | ✓ | None. | Full regression passes; vulnerability closed. | M |
| **1.3** | `context-requirements` domain: `RequirementDocument`, `Clarification`, `AcceptanceCriterion` — Workspace-scoped. | Backend Engineer | | ✓ | | | ✓ | ✓ | | None. | Unit tests, zero mocks, cover every invariant. | M |
| **1.4** | `persistence-postgres/requirements` repositories. | Backend Engineer | | ✓ | | | ✓ | ✓ | | 1.2, 1.3. | Passes `repositoryContractTests`, including tenant isolation. | M |
| **1.5** | Real Anthropic API call behind `LlmProviderPort`. | Backend Engineer | | ✓ | | ✓ | | ✓ | ✓ | None. | Passes `llmProviderContractTests` against the real call; resilience verified; credentials via `SecretsVaultPort`. | M |
| **1.6** | Real `requirements-analyst` capability: prompt, structuring logic, ≥1 AI-suggested (never silent) acceptance criterion. | AI/Backend Engineer | | | | ✓ | ✓ | ✓ | ✓ | 1.3, 1.5. | Produces ≥1 `Requirement`; low-confidence input produces a `Clarification`; every invocation recorded. | L |
| **1.7** | `CapabilityResolverPort`'s first real adapter. | Backend Engineer | | ✓ | ✓ | | | ✓ | ✓ | 1.6. | Passes a new shared contract-test suite; unregistered capability fails clearly. | M |
| **1.8** | `SubmitBusinessIdea` use case — captures Project Name, Business Area, Customer, Country, Project Type (opaque), and idea text, scoped to a `Workspace`. | Backend Engineer | | ✓ | | | | ✓ | | 1.3, 1.4. | Draft `RequirementDocument` persisted with all fields; empty idea text rejected. | M |
| **1.9** | Dashboard screen — empty state, single "Start New Project" action. | Frontend Engineer | ✓ | | | | | ✓ | ✓ | 1.1. | Renders correctly for a zero-project user; the one action navigates to Start New Project. | S |
| **1.10** | Start New Project UI — collects Project Name/Business Area/Customer/Country/Project Type (dropdown, SAP Platform Pack-supplied values) + idea text; real `<label>`s, not placeholders. | Frontend Engineer | ✓ | | | | | ✓ | ✓ | 1.8, 1.9. | Submitting starts a Discovery session; accessible labelling verified. | M |
| **1.11** | `AnswerClarification` use case. | Backend Engineer | | ✓ | | | | ✓ | | 1.8, 1.6. | Answering resolves the `Clarification` and triggers exactly one re-structuring pass; no duplicate questions. | M |
| **1.12** | Clarification Q&A UI — quoted source-idea context, staged progress messaging, labelled inputs. | Frontend Engineer | ✓ | | | | | ✓ | ✓ | 1.11. | Every unanswered `Clarification` shown with its triggering fragment quoted; accessible. | L |
| **1.13** | `context-project` domain: `Project` aggregate — `id`, `workspaceId`, `name`, `businessArea`, `customer`, `country`, `projectType` (opaque string), `description`, `sourceRequirementDocumentId`. | Backend Engineer | | ✓ | | | ✓ | ✓ | | None. | Creatable only from an approved `RequirementDocument` reference; `projectType` never a hardcoded Kernel enum; unit-tested, zero mocks. | M |
| **1.14** | `persistence-postgres/project` repository. | Backend Engineer | | ✓ | | | ✓ | ✓ | | 1.2, 1.13. | Passes tenant-isolation contract tests; no cross-schema foreign key into Requirements Intake's tables. | M |
| **1.15** | `ApproveRequirementDocument` use case — confirmation gating, `Project` creation, `requirements.document.captured.v1` emission, failure-path event on validation failure. | Backend Engineer | | ✓ | | | | ✓ | | 1.8, 1.14. | Rejects confirmation with any unanswered `Clarification`; creates exactly one `Project`; success/failure events verifiably in the outbox. | L |
| **1.16** | User Confirmation UI ("Project Charter" framing) — every requirement + acceptance criteria, derived confidence badges, structured headings. | Frontend Engineer | ✓ | | | | | ✓ | ✓ | 1.15. | Confirm action disabled while clarifications outstanding; screen-reader-navigable. | L |
| **1.17** | `context-digital-twin` domain (minimal): `DigitalTwinNode`, `DigitalTwinEdge`, `NodeTypeDefinition`, `RelationshipTypeDefinition` — scoped only to this slice's node/relationship types. | Backend Engineer | | ✓ | | | ✓ | ✓ | | None. | Matches [ADR-0021](../../adr/0021-project-digital-twin-knowledge-graph.md)'s model exactly; unit-tested, zero mocks; no node/relationship type beyond what VS-1 needs. | L |
| **1.18** | `GraphStorePort`'s first real adapter. | Backend Engineer | | ✓ | | | ✓ | ✓ | | 1.17. | Passes `testing-kit`'s `graphStoreContractTests` (net new, mirroring every other port). | L |
| **1.19** | Digital Twin write integration — wires Project creation to write `Project`/`Platform`/`ProjectType`/`Owner`/`CreationEvent` nodes and their relationships. | Backend Engineer | | ✓ | ✓ | | | ✓ | ✓ | 1.15, 1.17, 1.18. | Every successful confirmation produces a coherent, queryable node/edge set; a failed confirmation writes nothing. | M |
| **1.20** | Discovery `WorkflowDefinition`, full: intake → structuring → clarification loop → confirmation → Project creation → Digital Twin update → audit → telemetry. | Backend/Workflow Engineer | | ✓ | ✓ | | | ✓ | ✓ | 1.7, 1.11, 1.19. | Full run transitions correctly end to end; every transition emits the expected events. | L |
| **1.21** | Initial Project Workspace screen — created `Project`'s metadata, linked requirements, a simple Digital Twin summary, "what happens next" panel. | Frontend Engineer | ✓ | | | | | ✓ | ✓ | 1.15, 1.19. | Confirms the created `Project` with real data; static panel previews future capabilities without implying they exist. | M |
| **1.22** | End-to-end vertical-slice demo: login through Initial Project Workspace, against real adapters. | QA/Backend Engineer | | ✓ | ✓ | | ✓ | ✓ | | Every prior task. | `pnpm run demo:sprint1` runs unattended; produces a real `Project`, real Digital Twin nodes, and a real outbox event. | M |
| **1.23** | First real GitHub Actions CI run. | DevOps Engineer | | | | | | ✓ | | ✓ | Push authorized (user's call). | CI executes successfully on a real runner for the first time. | S |

## Traceability to original SAF tickets

Former SAF-39–56 map onto this table as follows: SAF-39→1.3, SAF-40→1.4, SAF-41→1.8, SAF-42→1.10, SAF-43→1.5, SAF-44→1.6, SAF-45→1.7, SAF-46→1.11, SAF-47→1.12, SAF-48→1.13, SAF-49→1.14, SAF-50→1.15, SAF-51→1.16, SAF-52→1.20, SAF-53→1.22, SAF-54→1.2, SAF-55→1.23. New tickets added to [docs/backlog/sprint-1-backlog.md](../../backlog/sprint-1-backlog.md): **SAF-57** (Dashboard, Task 1.9), **SAF-58** (richer Start New Project fields, part of Tasks 1.8/1.10/1.13), **SAF-59** (Digital Twin write integration, Task 1.19), **SAF-60** (Initial Project Workspace, Task 1.21). **SAF-34/SAF-35** (Digital Twin domain + `GraphStorePort` adapter) are pulled forward from their original Sprint 7 position, explicitly scoped down to Tasks 1.17/1.18's minimal node-type set — not their full originally-planned scope.

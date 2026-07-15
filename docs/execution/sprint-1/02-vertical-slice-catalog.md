# Sprint 1 Vertical Slice Catalog

Two Vertical Slices, each independently deployable within the Sprint (see each slice's "Independent deployability" note). Effort is sized T-shirt style (S/M/L/XL) — no fabricated hour/point estimates, consistent with this platform's standing discipline against manufactured precision.

---

## VS-1 — Capture and Structure a Business Idea

| Field | Detail |
|---|---|
| **Identifier** | VS-1 |
| **Title** | Capture and Structure a Business Idea |
| **Business objective** | Turn a user's free-text business idea into a validated, structured, clarified set of requirements — with zero silent guessing. |
| **User journey** | Login → Idea submission → (loop: Clarification Q&A) → resolved, structured requirement set ready for review. Ends just short of approval (VS-2's job). |
| **Screens involved** | Login (new), Idea Submission (SAF-42), Clarification Q&A (SAF-47). |
| **Capabilities executed** | `structure-business-requirement`, resolved via `CapabilityResolverPort`'s first real adapter. |
| **Workflow executed** | The Discovery `WorkflowDefinition`'s intake portion: `capture-idea` → `capability-request(structure-business-requirement)` → conditional `human-approval` (clarification) loop. Transitions `pending → running → awaiting_approval → running → ...`. |
| **Platform events** | `workflow.run.started.v1`, `workflow.step.completed.v1` (per step) — both pre-existing event types, now exercised by a new, real workflow definition for the first time. |
| **Generated artifacts** | `RequirementDocument` (draft), `Requirement`, `Clarification`, `AcceptanceCriterion`. |
| **Digital Twin nodes affected** | None written today (`context-digital-twin` doesn't exist — Sprint 7). Conceptually: `Requirement`/`Clarification` nodes with `derived-from` edges to the source idea, once built. Interim traceability: real persisted rows + `AgentInvocation` audit records. |
| **Repositories affected** | New: `RequirementDocumentRepository`, `RequirementRepository`, `ClarificationRepository`, `AcceptanceCriterionRepository` (all in `persistence-postgres/requirements`). |
| **Packages affected** | `context-requirements` (domain + application), `persistence-postgres/requirements` (new), `llm-adapters/anthropic`, `context-capability-registry`, `ports` (no changes — `CapabilityResolverPort` already defined), `workflow-engine-adapters/in-memory` (new workflow definition, no engine change). |
| **Applications affected** | `apps/web` (login + idea submission + clarification screens), `apps/api-gateway` (new routes), `apps/orchestrator` (new workflow definition), `apps/worker` (if structuring runs as a background job — confirmed at implementation time against the existing worker/orchestrator split). |
| **Acceptance criteria** | A real user reaches the idea-submission screen only after authenticating; submitting non-empty idea text always produces a draft `RequirementDocument`; the `requirements-analyst` capability is invoked via a real Anthropic API call, never a mock, in this slice's demonstration; every `Clarification` the agent raises is answerable and re-triggers structuring; the loop terminates (no unresolved `Clarification`s) for a realistic idea within a bounded number of rounds. |
| **Definition of Done** | Meets [DEFINITION_OF_DONE.md](../../../DEFINITION_OF_DONE.md) and the Engineering Planning Principles' "every completed feature must" list in full — see per-task Testing/Telemetry/Documentation/Audit requirements below. |
| **Testing requirements** | See [05-test-strategy.md](05-test-strategy.md)'s VS-1 section. |
| **Telemetry requirements** | Structured logs + OTel spans for: idea submission, each structuring invocation (with prompt version and resolved provider recorded), each clarification answer. |
| **Audit requirements** | Every `AgentInvocation` (structuring pass) recorded with inputs, resolved provider `{providerType, providerId, providerVersion}`, and output — the AI First principle's replay/audit requirement. |
| **Documentation requirements** | Package READMEs for `persistence-postgres/requirements` (new) and updates to `context-requirements`'s existing README; an architecture-doc update to [02-domain-model.md](../../architecture/02-domain-model.md) confirming `RequirementDocument`/`Clarification`/`AcceptanceCriterion` are now implemented, not just designed. |
| **Estimated effort** | **L** — the sprint's largest slice, carrying its only genuinely novel integration risk. |
| **Risk assessment** | See [04-risk-register.md](04-risk-register.md) — primary risks are real-LLM latency/reliability (mitigated by the resilience patterns ADR-0016 already mandates) and clarification-loop non-termination on a pathological input (mitigated by a bounded round count). |
| **Business value** | The platform's first real demonstration of "AI-guided discovery" — the entire Sprint 1 mission's most distinctive claim. |
| **Demonstration scenario** | Full scenario: [06-demonstration-plan.md](06-demonstration-plan.md). |
| **Implementation dependencies** | Task 1.2 (`drizzle-orm` CVE fix) gates Task 1.4 (persistence). No dependency on VS-2. |
| **Independent deployability** | Yes — a working "idea in, structured/clarified requirements out" capability is independently useful even before VS-2 exists (e.g., for an analyst reviewing structured output manually) and could ship on its own. |

### VS-1 Engineering Tasks

| Task | Purpose | Owner type | FE | BE | Workflow | AI | Docs | Testing | DevOps | Dependencies | Acceptance criteria | Effort |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **1.1** | Add a login screen wired to the existing OIDC redirect flow (Quick Win #2). | Frontend Engineer | ✓ | | | | | ✓ | | None (backend OIDC flow already real, Sprint 0). | A user can reach and complete sign-in from `apps/web`; redirects correctly on success/failure. | S |
| **1.2** | Fix the `drizzle-orm` High-severity CVE across all existing `persistence-postgres/*` packages. | Backend Engineer | | ✓ | | | | ✓ | ✓ | None. | Full regression cycle passes; vulnerability confirmed closed by a dependency audit. | M |
| **1.3** | `context-requirements` domain: `RequirementDocument`, `Clarification`, `AcceptanceCriterion` aggregates (SAF-39), including the corrected Workspace-scoping (not Project) from the Product Design Review. | Backend Engineer | | ✓ | | | ✓ | ✓ | | None. | Unit tests, zero mocks, cover every invariant (empty idea text rejected, etc.). | M |
| **1.4** | `persistence-postgres/requirements`: repository adapters for all four aggregates (SAF-40). | Backend Engineer | | ✓ | | | ✓ | ✓ | | Task 1.2, 1.3. | Passes `testing-kit`'s `repositoryContractTests`, including tenant isolation. | M |
| **1.5** | Replace `AnthropicLlmAdapter`'s mocked response with a real Anthropic API call (SAF-43). | Backend Engineer | | ✓ | | ✓ | | ✓ | ✓ | None. | Still passes `llmProviderContractTests` against the real call; resilience verified against a real timeout/retry case; credentials via `SecretsVaultPort`. | M |
| **1.6** | Real `requirements-analyst` capability implementation: versioned prompt, structuring logic, at least one AI-suggested (never silently applied) acceptance criterion (SAF-44 + Quick Win #5). | AI/Backend Engineer | | | | ✓ | ✓ | ✓ | ✓ | Task 1.3, 1.5. | Produces ≥1 `Requirement` from concrete idea text; low-confidence input produces a `Clarification`, never a guess; every invocation recorded for replay. | L |
| **1.7** | `CapabilityResolverPort`'s first real adapter, resolving `structure-business-requirement` to the `requirements-analyst` provider (SAF-45). | Backend Engineer | | ✓ | ✓ | | | ✓ | ✓ | Task 1.6. | Passes a new shared contract-test suite for `CapabilityResolverPort`; resolving an unregistered capability fails clearly. | M |
| **1.8** | `SubmitBusinessIdea` use case (SAF-41). | Backend Engineer | | ✓ | | | | ✓ | | Task 1.3, 1.4. | Given idea text + workspace reference, a draft `RequirementDocument` is persisted; empty input rejected. | S |
| **1.9** | Idea submission UI (SAF-42) + accessibility fix (real `<label>`, not placeholder-only) (Quick Win #9 part). | Frontend Engineer | ✓ | | | | | ✓ | ✓ | Task 1.1, 1.8. | A user can submit an idea and see confirmation a session started; labelled per accessibility requirements. | M |
| **1.10** | `AnswerClarification` use case (SAF-46). | Backend Engineer | | ✓ | | | | ✓ | | Task 1.8, 1.6. | Answering marks the `Clarification` resolved and triggers exactly one re-structuring pass; no duplicate questions on a second pass. | M |
| **1.11** | Clarification Q&A UI (SAF-47) + quoted source-idea context (Quick Win #3) + staged progress messaging (Quick Win #4) + labelled inputs (Quick Win #9 part). | Frontend Engineer | ✓ | | | | | ✓ | ✓ | Task 1.10. | Every unanswered `Clarification` shown with its triggering idea fragment quoted; progress staged, not a bare spinner; each input has its own label. | L |
| **1.12** | Discovery `WorkflowDefinition`'s intake+structuring+clarification portion (part of SAF-52). | Backend/Workflow Engineer | | ✓ | ✓ | | | ✓ | ✓ | Task 1.7, 1.10. | Full run transitions correctly through `pending → running → awaiting_approval → running`, repeating as needed; every transition emits the existing `workflow.run.*`/`workflow.step.completed.v1` events. | M |
| **1.13** | First real GitHub Actions CI run, once this slice's first PR is ready (SAF-55). | DevOps Engineer | | | | | | ✓ | | ✓ | Push authorized (still gated on the user, per standing project policy). | `.github/workflows/ci.yml` executes successfully on a real runner for the first time. | S |

---

## VS-2 — Approve Discovery into an Approved Project

| Field | Detail |
|---|---|
| **Identifier** | VS-2 |
| **Title** | Approve Discovery into an Approved Project |
| **Business objective** | Give the user one clear decision point, and turn approval into a real, durable `Project`. |
| **User journey** | Resolved requirement set (VS-1's output) → Project Charter review → Approve (or Request Changes, looping back into VS-1's clarification screen) → Project Ready confirmation. |
| **Screens involved** | Project Charter / Review & Approve (SAF-51), Project Ready (confirmation). |
| **Capabilities executed** | None new — approval and Project creation are use cases, not Capabilities (see [10-capability-model-review.md](../../governance/sprint-1-product-design-review/10-capability-model-review.md)). |
| **Workflow executed** | The Discovery `WorkflowDefinition`'s completion portion: final `human-approval` (review) step → `create-project` step. Transitions `awaiting_approval → running → completed`. |
| **Platform events** | `requirements.document.captured.v1` (first real emission — previously "designed, not yet emitted," per [BASELINE.md](../../../BASELINE.md)), `workflow.run.completed.v1`. |
| **Generated artifacts** | An `approved` `RequirementDocument`; a new `Project`. |
| **Digital Twin nodes affected** | None written today. Conceptually: a `Project` node with a `fulfilled-by` edge to the approved `RequirementDocument`, once built. Interim traceability: the real `Project` row + the real outbox event. |
| **Repositories affected** | New: `ProjectRepository` (in `persistence-postgres/project`). |
| **Packages affected** | `context-project` (domain — new `Project` aggregate), `persistence-postgres/project` (new), `context-requirements` (application layer — `ApproveRequirementDocument`), `events-adapters/postgres-outbox` (no changes — existing adapter, new event type flowing through it), `workflow-engine-adapters/in-memory` (workflow definition completion). |
| **Applications affected** | `apps/web` (review/approve + confirmation screens), `apps/api-gateway` (approval route), `apps/orchestrator` (workflow completion), `tools/sprint1-demo` (new, mirroring `tools/sprint0-demo`). |
| **Acceptance criteria** | Approval is rejected while any `Clarification` is unanswered; a successful approval persists an `approved` `RequirementDocument` and creates exactly one `Project` in the same logical operation; `requirements.document.captured.v1` is verifiably in the outbox table afterward, not just asserted in application code. |
| **Definition of Done** | Same standard as VS-1 — see [DEFINITION_OF_DONE.md](../../../DEFINITION_OF_DONE.md) and the Engineering Planning Principles. |
| **Testing requirements** | See [05-test-strategy.md](05-test-strategy.md)'s VS-2 section. |
| **Telemetry requirements** | Structured logs + OTel spans for: approval attempts (including rejected ones, with reason), Project creation, event emission. |
| **Audit requirements** | The approval action itself is an `AuditEvent` (Governance context) — a human decision with real consequences is always audit-logged, per the Governance context's existing design, not a new mechanism. |
| **Documentation requirements** | Package README for `persistence-postgres/project` (new); `context-project`'s README updated to reflect the new `Project` aggregate; [02-domain-model.md](../../architecture/02-domain-model.md) updated to confirm `Project` is now implemented. |
| **Estimated effort** | **M** — no new external integration risk; well-understood patterns (domain + persistence + event emission) Sprint 0 already proved. |
| **Risk assessment** | See [04-risk-register.md](04-risk-register.md) — primary risk is a partial failure between `Project` creation and event emission; mitigated by the same transactional-outbox guarantee (same-transaction write) already proven in Sprint 0. |
| **Business value** | The literal "idea to approved project" promise in the Sprint 1 mission statement — the moment Discovery output becomes a committed business asset. |
| **Demonstration scenario** | Full scenario: [06-demonstration-plan.md](06-demonstration-plan.md). |
| **Implementation dependencies** | VS-1 (a resolved `RequirementDocument` to approve) must be functionally complete; Task 1.2 (CVE fix) gates Task 2.2. |
| **Independent deployability** | Only meaningful once VS-1 exists — but once it does, VS-2 is a complete, self-contained addition (approval + Project creation) deployable on its own on top of VS-1. |

### VS-2 Engineering Tasks

| Task | Purpose | Owner type | FE | BE | Workflow | AI | Docs | Testing | DevOps | Dependencies | Acceptance criteria | Effort |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **2.1** | `context-project` domain: `Project` aggregate (`id`, `workspaceId`, `name`, `description`, `sourceRequirementDocumentId`) (SAF-48). | Backend Engineer | | ✓ | | | ✓ | ✓ | | None. | `Project` creatable only from an approved `RequirementDocument` reference; unit-tested, zero mocks. | S |
| **2.2** | `persistence-postgres/project`: repository adapter for `Project` (SAF-49). | Backend Engineer | | ✓ | | | ✓ | ✓ | | Task 1.2, 2.1. | Passes tenant-isolation contract tests; no cross-schema foreign key into Requirements Intake's tables. | M |
| **2.3** | `ApproveRequirementDocument` use case: approval gating, `Project` creation, `requirements.document.captured.v1` emission (SAF-50). | Backend Engineer | | ✓ | | | | ✓ | | Task 1.8 (VS-1), 2.2. | Rejects approval with any unanswered `Clarification`; creates exactly one `Project`; event verifiably in the outbox. | M |
| **2.4** | Discovery `WorkflowDefinition`'s completion portion (remainder of SAF-52). | Backend/Workflow Engineer | | ✓ | ✓ | | | ✓ | ✓ | Task 1.12 (VS-1), 2.3. | Full run reaches `completed`; `workflow.run.completed.v1` emitted. | S |
| **2.5** | Review & Approve UI, framed as "Project Charter" (Quick Win #6), with derived confidence badges (Quick Win #8) and structured, labelled headings (Quick Win #9 part) (SAF-51). | Frontend Engineer | ✓ | | | | | ✓ | ✓ | Task 2.3. | Shows every requirement + acceptance criteria with a confidence badge; approve disabled while clarifications are outstanding; screen-reader-navigable structure. | L |
| **2.6** | End-to-end vertical-slice demo: idea submission through `Project` creation, against real adapters (SAF-53). | QA/Backend Engineer | | ✓ | ✓ | | ✓ | ✓ | | Every VS-1 and VS-2 task. | `pnpm run demo:sprint1` runs unattended and produces a real, inspectable `Project` row and outbox event. | M |
| **2.7** | Project Ready confirmation screen with a "what happens next" panel (Quick Win #7). | Frontend Engineer | ✓ | | | | | ✓ | ✓ | Task 2.3. | Confirms the created `Project`; static panel previews future-sprint capabilities without implying they exist today. | S |

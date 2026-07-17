# Engineering Decision Log

**Established:** 2026-07-17, from the VS-1 (Discovery Workspace) Engineering Retrospective. Captures **implementation-level** decisions — judgment calls made while building, at a level of detail below what warrants an ADR. If a decision changes or reverses an existing ADR, it belongs in `docs/adr/`, not here; this log is a lower-tier, add-only history of "how we actually built it and why," for the next engineer (human or AI) who wonders "why is this shaped this way."

---

### ED-001 — Composition-root orchestration for the Discovery workflow

**Date:** 2026-07-17. **Affected packages:** `apps/orchestrator`, `packages/context-requirements`.

**Reason:** The Discovery workflow (idea → structuring → clarification loop → confirmation → Project creation) spans two bounded contexts (`context-requirements`, `context-project`). Implementing it naively inside either context's `application/` layer would call the other context's domain/application code directly.

**Decision:** Discovered mid-implementation that `dependency-cruiser`'s `application-no-cross-context` rule forbids exactly this. Moved the orchestration entirely into `apps/orchestrator/src/discovery-workflow.ts` — a composition root, explicitly not bound by that rule (it only applies inside `packages/context-*/src/application/`) — per `04-service-boundaries.md`'s existing guidance that cross-context business logic legitimately lives at the composition root.

**Alternatives considered:** (1) Weaken the dependency-cruiser rule for this one case — rejected, would erode the rule for everyone. (2) Add a new "orchestration" bounded context — rejected, invents a new architectural concept for what the existing composition-root pattern already covers.

**Impact:** `approveRequirementDocument` (in `context-requirements`) was changed to *emit* `requirements.document.captured.v1` rather than import `context-project` directly — the correct, already-approved pattern (ADR-0007), just not yet exercised by real code before this.

**Lessons learned:** `dependency-cruiser` catching this at build time, not code review, is exactly the fitness-function value proposition working as designed. Future cross-context workflows should default to composition-root placement from the start, not be discovered the hard way.

---

### ED-002 — Deterministic Project ID + bounded polling instead of a correlation registry

**Date:** 2026-07-17. **Affected packages:** `apps/orchestrator`.

**Reason:** `confirmDiscoveryWorkflow` needs to return the newly created `Project` to its caller, but `Project` creation happens asynchronously (a real event subscriber, not a direct call, per ADR-0007). The caller has no `Project` ID to look up — only the `RequirementDocument` ID it approved.

**Decision:** `deterministicProjectId(requirementDocumentId) = "project-for-" + requirementDocumentId` — both the event subscriber (`main.ts`) and the caller (`discovery-workflow.ts`) derive the same ID independently, no lookup table needed. The caller then does a short, bounded poll (20 attempts × 100ms) against the (in-process or local-Postgres) projects repository.

**Alternatives considered:** (1) A dedicated correlation-ID registry table mapping `requirementDocumentId → projectId` — rejected as unnecessary machinery for a 1:1, deterministic relationship. (2) Make `Project` creation synchronous, breaking the event-only cross-context rule — rejected outright, violates ADR-0007.

**Impact:** Works cleanly at Sprint 1's scale (one in-memory/local-Postgres outbox relay, sub-second in practice). Documented as revisit-worthy if a later sprint's scale needs real request/response correlation instead.

**Lessons learned:** A deterministic, derivable ID is a legitimate lightweight alternative to a correlation registry whenever the relationship really is 1:1 and derivable — don't reach for a registry by default.

---

### ED-003 — Bounding the clarification loop against the workflow engine's fixed step count

**Date:** 2026-07-17. **Affected packages:** `apps/orchestrator`, `packages/workflow-engine-adapters/in-memory`.

**Reason:** `InMemoryWorkflowEngineAdapter`'s `stepsPerRun` is a fixed count per adapter instance (a documented Sprint 0 provisional limitation) — but the Discovery clarification loop is inherently variable-length (a user might need 1 round or several).

**Decision:** Bounded the loop to `MAX_CLARIFICATION_ROUNDS = 5` in application code, and sized the adapter's `stepsPerRun: 20` generously above the worst case (5 rounds × ~2 steps/round + fixed steps). Past the bound, the run is explicitly cancelled with a clear reason, not left to fail obscurely against the step ceiling.

**Alternatives considered:** (1) Make `stepsPerRun` unbounded/dynamic — rejected as out of scope; it's an existing, documented adapter limitation, not something VS-1's own acceptance criteria required fixing. (2) No bound at all — rejected, an unbounded clarification loop is both a real UX failure mode and (per the Risk Register) a workflow-engine risk waiting to happen.

**Impact:** A pathological or adversarial idea cannot loop forever; the bound is enforced in code, not just documentation.

**Lessons learned:** A known adapter limitation doesn't have to be fixed to be safely built against — bounding the caller's own behavior around it, with an explicit, loud failure mode, is a legitimate and often better-scoped choice than fixing the adapter.

---

### ED-004 — URL-threaded `runId`/`round` state instead of a server-side UI-session store

**Date:** 2026-07-17. **Affected packages:** `apps/web`.

**Reason:** `answerDiscoveryClarification`/`confirmDiscoveryWorkflow` require the real `runId` the workflow engine assigned at `startRun` — but `GET /discovery/:id` doesn't (and structurally can't cheaply) return it, since `apps/orchestrator` never persists a `requirementDocumentId → runId` mapping anywhere queryable after the initial `start`/`answer` response.

**Decision:** Thread `runId` and the current clarification `round` through the browser URL's query string (`/discovery/[id]?runId=...&round=...`) across the fully server-rendered, no-client-JS screen flow, rather than introduce any server-side UI-session storage.

**Alternatives considered:** (1) Add a `requirementDocumentId → runId` lookup table in `apps/orchestrator` — rejected as new persisted state solely to serve the UI, not a real domain need. (2) A client-side session/cookie holding UI flow state — rejected, adds client JS and a new state-management concept this codebase's "minimal JS, server components only" precedent (established at SAF-16) doesn't otherwise need.

**Impact:** Zero new persistence, zero client JS, at the cost of slightly less pretty URLs. Consistent with the existing minimal-JS precedent throughout `apps/web`.

**Lessons learned:** For a fully server-rendered flow with no client-side state management, the URL itself is a legitimate, simple place to carry short-lived, non-sensitive UI-flow state — don't default to inventing a session-store concept just because a value needs to survive across page loads.

---

### ED-005 — One Next.js route covering both Clarification Q&A and Project Charter

**Date:** 2026-07-17. **Affected packages:** `apps/web`.

**Reason:** The Product Design Review's own journey diagram treats "which screen renders" as a pure function of `unansweredClarifications.length` — the backend's own workflow branches on exactly this condition.

**Decision:** `apps/web/src/app/discovery/[id]/page.tsx` renders the Clarification Q&A UI when `unansweredClarifications.length > 0`, else the Project Charter UI — one route, one data fetch, branching JSX — instead of two separate routes with duplicated fetch/auth-check logic.

**Alternatives considered:** Two separate routes (`/discovery/[id]/clarify` and `/discovery/[id]/review`) with a redirect between them based on the same condition — rejected as extra indirection with no additional information gained, mirroring the Product Design Review's own explicit rejection of splitting Artifact Review and Approval into two screens for the same reason.

**Impact:** Less code, one auth-check/data-fetch path to maintain, matches the backend's actual state model 1:1.

**Lessons learned:** When two "screens" are really one data state with two renderings, resist splitting them into separate routes by default — check whether the backend already treats them as one state machine, and mirror that.

---

### ED-006 — Session-derived identity at the `api-gateway` proxy layer

**Date:** 2026-07-17. **Affected packages:** `apps/api-gateway`, `apps/web`.

**Reason:** Discovery proxy routes need `tenantId`/`actorId` to forward to `apps/orchestrator`. The browser/`apps/web` could in principle supply these directly in the request body, but that would let a client claim any identity.

**Decision:** Every Discovery proxy route (`discovery-proxy-routes.ts`) unseals the session cookie itself (`unsealSession`, same mechanism as `handleMe`) and derives `tenantId`/`actorId` server-side, discarding any client-supplied values of the same name. `apps/web` never sees or needs to know these fields.

**Alternatives considered:** Have `apps/web` decode the session and pass identity fields explicitly — rejected, `apps/web` doesn't have (and per the BFF pattern, ADR-0010, should never need) the session secret; this would also mean two places implement session-unsealing instead of one.

**Impact:** Verified by a dedicated test (`discovery-proxy-routes.spec.ts`) that submits attacker-supplied `tenantId`/`actorId` values and confirms they're discarded in favor of the session's real values.

**Lessons learned:** "Where is identity actually established" should be a single, narrow answer in the codebase (here: the `api-gateway` proxy layer) — every other layer downstream should receive already-verified identity, never re-derive or accept it from a less-trusted caller.

---

### ED-007 — Document-level (not per-requirement) confidence-badge derivation

**Date:** 2026-07-17. **Affected packages:** `apps/web`.

**Reason:** The Product Design Review's Quick Win #8 specifies a **per-`Requirement`** confidence badge, derived from whether any `Clarification` was ever raised against that specific requirement (via `relatedRequirementIds`). `structure-business-requirement`'s actual prompt never populates that field — a clarification is raised about the idea text in general, not tied to an already-extracted requirement.

**Decision:** Derive the badge at the `RequirementDocument` level instead — "Clarified" if the whole document ever had any clarification raised, applied uniformly to every requirement in it, "High confidence" otherwise. Disclosed explicitly in code comments and the Exit Gate report as a simplification of the PDR's stated design, not silently presented as per-requirement precision the data doesn't support.

**Alternatives considered:** (1) Silently implement the per-requirement version anyway, since the field exists on the type — rejected, would always show "High confidence" for every requirement (since `relatedRequirementIds` is always empty), which is worse than an honestly-labeled coarser derivation. (2) Extend the prompt now to populate the field for real — deferred to `CI-B2` (Continuous Improvement Backlog) as a contained but non-trivial follow-up, not done inline as part of the UI task.

**Impact:** A real, working confidence signal ships in VS-1, honestly scoped to what the data actually supports.

**Lessons learned:** When a design doc's recommendation assumes a data shape the actual upstream capability doesn't produce, the right move is a disclosed, honest simplification — not silently building the "designed" version against data that can't support it, and not blocking the whole screen on fixing the upstream capability first.

---

### ED-008 — `tools/sprint1-demo` spawns real built apps as child processes

**Date:** 2026-07-17. **Affected packages:** `tools/sprint1-demo`.

**Reason:** `tools/sprint0-demo` composes real adapters directly in one process — but VS-1's real components are three actual running HTTP services (`api-gateway`, `orchestrator`, `web`), not a set of in-process adapters.

**Decision:** `tools/sprint1-demo` spawns the real built `apps/api-gateway/dist/main.js` and `apps/orchestrator/dist/main.js` as child processes (on dedicated demo ports, avoiding collision with a developer's own `pnpm dev`), waits for real `/health` checks, then drives them over real HTTP exactly as a browser client would.

**Alternatives considered:** Reconstruct the same composition-root wiring (`buildDependencies()`/`createServer()`) directly inside the demo script, as Sprint 0's demo does for lower-level adapters — rejected: `apps/orchestrator`/`apps/api-gateway` are apps, not library packages, with no public export surface meant for another package to import; spawning the real built artifact is both simpler and more faithful ("the same artifact a real deployment runs").

**Impact:** The demo genuinely proves the real HTTP chain, not a reconstruction of it.

**Lessons learned:** When the previous sprint's demo-script pattern doesn't fit because the shape of "what's real" has changed (single process → multiple real services), don't force-fit the old pattern — spawn the real artifacts instead.

---

### ED-009 — `pnpm.overrides` for `esbuild`/`postcss` transitive CVEs

**Date:** 2026-07-17. **Affected packages:** root `package.json` (monorepo-wide).

**Reason:** The CI run's OSV scanner step flagged `esbuild@0.18.20` (via `drizzle-kit`'s deprecated `@esbuild-kit/core-utils` dependency, GHSA-67mh-4wv8-2f99) and `postcss@8.4.31` (via `next@15.5.20`'s own internal pin, GHSA-qx2v-qp2m-jg93). Neither has a newer *direct* dependency version to bump — both are pinned inside a transitive dependency's own `package.json`.

**Decision:** Force both to safe versions monorepo-wide via root `package.json`'s `pnpm.overrides` (`esbuild: ^0.25.0`, `postcss: ^8.5.10`), rather than waiting on `drizzle-kit`/`next` upstream releases.

**Alternatives considered:** (1) Wait for upstream — rejected, no committed timeline and the CVEs are real and currently exploitable in theory. (2) Patch `node_modules` directly (`pnpm patch`) — rejected as heavier-weight than needed; a version override is sufficient since both packages are semver-compatible drop-ins at this range (esbuild used only as a build-time CLI/API here; postcss 8.4→8.5 has no breaking changes).

**Impact:** Full monorepo `build`/`typecheck`/`test`/`lint`/`format`/`deps`/`fitness` re-verified clean after the override, before pushing.

**Lessons learned:** `pnpm.overrides` is the right tool specifically when a CVE lives in a *transitive* dependency's own declared version with no direct-dependency bump available — reach for it before more invasive options.

---

### ED-010 — Widened repository field types on `OrchestratorDependencies` for testability

**Date:** 2026-07-17. **Affected packages:** `apps/orchestrator`.

**Reason:** `OrchestratorDependencies` originally typed `requirements`/`clarifications`/`acceptanceCriteria` as the *concrete* Drizzle repository classes (`RequirementRepository`, etc.), each with a `private readonly pool: Pool` constructor field — making them nominally, not structurally, typed. A test fake object literal could not satisfy that type without an `any` cast, since TypeScript can't structurally match a class with private fields.

**Decision:** Widened those three fields to structural interfaces — `Repository<T, string> & { findByRequirementDocumentId(...): ... }` (mirroring the pattern `discovery-workflow.ts`'s own `DiscoveryWorkflowDependencies` already used) — so a plain fake object satisfies the type with zero casts.

**Alternatives considered:** Keep the concrete class types and cast fakes with `as any` in tests — rejected outright; this codebase's own discipline treats an `any` cast introduced to work around a type as a smell worth fixing at the source, not suppressing at the call site.

**Impact:** `apps/orchestrator/src/test-fake-dependencies.ts` and every spec file using it (`discovery-workflow.spec.ts`, `server.spec.ts`) needed zero `any` casts.

**Lessons learned:** When a composition root's own dependency-interface typing forces test doubles into `any` casts, that's a signal the interface itself is over-specified (naming a concrete implementation where a structural shape would do) — fix the interface, not the test.

---

### ED-011 — Reconciling three divergent local/remote copies of the same repository (this session)

**Date:** 2026-07-17. **Affected packages:** none (repository/tooling process, not code).

**Reason:** Mid-session, the project's git remote moved twice — first attempted push failed (no usable credential for the original `SAP-App-Fiori-Factory` remote), then two *different* GitHub repositories (`Enterprise-Engineering-OS`, a squash-imported copy, and `Builder-Platform-OS`, which carried the actual commit history because the user had already pushed it and made two further commits directly in this same local working tree via their IDE) both turned out to hold nearly-identical content.

**Decision:** Established which remote actually shared commit ancestry with the local repository (`git merge-base --is-ancestor`), pointed `origin` at that one (`Builder-Platform-OS`), and pushed as a clean fast-forward rather than attempting to merge or reconcile the squash-imported copy.

**Alternatives considered:** Treat the squash-imported `Enterprise-Engineering-OS` as canonical and rebase onto it — rejected once the ancestry check showed `Builder-Platform-OS` was a direct continuation of the real local history, which is strictly better (preserves every prior commit's context, not just a single "Initial import" squash).

**Impact:** Task 1.19 (first real CI run) completed against the correct, history-preserving remote.

**Lessons learned:** When multiple candidate remotes exist for what should be "one origin," verify ancestry (`git merge-base --is-ancestor`, `git log --oneline --graph --all`) before picking one — don't assume the most recently mentioned name is authoritative, and don't force-push to reconcile when a clean fast-forward is available.

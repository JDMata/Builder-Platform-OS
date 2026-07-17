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

---

### ED-012 — Fixing the OIDC nonce-validation defect found by real-browser verification, without expanding scope

**Date:** 2026-07-17. **Affected packages:** `packages/auth-core`, `apps/api-gateway`.

**Reason:** Manually driving VS-1's UI with a real headless browser (the first time this project ever had one) surfaced a real defect: `beginAuthorizationRequest()` generates a `nonce`, but `apps/api-gateway`'s `PendingAuthorizationRequest`/`handleCallback` never stored or forwarded it, so `openid-client` rejected every real login's ID token with `"unexpected JWT claim value encountered"`. No prior test could have caught this — every existing test/demo (`tools/sprint0-demo`, `tools/sprint1-demo`, `auth-core`'s own gated tests) deliberately uses Direct Grant specifically because no browser existed before this session.

**Decision:** Fixed narrowly — added `nonce` to `PendingAuthorizationRequest`, added a required `expectedNonce` field to `ExchangeCodeOptions`, threaded through to `client.authorizationCodeGrant()`. Nothing else touched. A second, unrelated defect surfaced incidentally while verifying the fix (`api-gateway` crashes on a non-JSON response from an unreachable `apps/orchestrator`, triggered here by a local port collision) was **deliberately left unfixed** and only recorded (`CI-A9`) — it's a real, separate gap, but fixing it wasn't part of what was authorized for this pass.

**Alternatives considered:** Fold the second (error-handling) defect into the same fix, since it was already found and understood — rejected; the user explicitly asked for the nonce fix with no out-of-scope changes, and DEFINITION_OF_DONE's "no undiscovered scope added" applies to bug fixes as much as features.

**Impact:** Verified twice, independently: a real Keycloak login now logs `"session established"` with real claims, and a real, HttpOnly `saf_session` cookie is set in the browser after a genuine username/password login. Full monorepo validation suite re-run clean, including both real-Keycloak-gated test files.

**Lessons learned:** A defect that "no test could have caught" isn't necessarily rare or exotic — it can be exactly this ordinary (a value generated in one function, silently dropped before the function that needs it). The fix for *that* is a real browser/E2E capability existing at all, not smarter unit tests of the same untested integration seam. Recorded, not actioned, as a testing-infrastructure gap — worth a deliberate future decision (an ADR or backlog item) on whether Playwright-based E2E coverage belongs in this project's standard test suite, rather than added ad hoc off the back of this one fix.

## ED-013: Absolute OIDC callback redirect + error handling for the Discovery proxy (CI-A9, CI-A10)

**Date:** 2026-07-17

**Affected packages:** `apps/api-gateway` (`build-dependencies.ts`, `auth-routes.ts`, `discovery-proxy-routes.ts`, `test-fake-dependencies.ts`, `auth-routes.spec.ts`, `discovery-proxy-routes.spec.ts`)

**Reason:** Re-running the real-browser login flow (immediately after `ED-012`'s nonce fix, same manual session) surfaced two more real defects. First, `handleCallback`'s success redirect was a relative path (`location: "/discovery/new"`), which the browser resolves against whatever origin the response actually came from — always `api-gateway`'s own real host, since Keycloak's `redirect_uri` is computed from whatever host directly received `/auth/login` (never through `web`'s rewrite). So every real login landed on `api-gateway:3001/discovery/new`, not `web:3002/discovery/new`. Second, that path happened to match `api-gateway`'s own `/discovery/*` proxy route pattern, forwarding to `orchestrator` — and in this environment (no real `ANTHROPIC_API_KEY`, plus a local port collision with Docker Desktop occupying port 3000), that request hit an unreachable or wrong process. `forwardToOrchestrator`'s `response.json()` on a non-JSON (HTML/error) response threw, and nothing in `discovery-proxy-routes.ts` caught it — an unhandled rejection that crashed the entire `api-gateway` process, taking down every other in-flight request with it, not just the one bad response.

**Decision:** Fixed both, narrowly. (1) Added `webUrl: string` to `ApiGatewayDependencies`, sourced from `SAF_WEB_URL` (default `http://localhost:3000`), and changed `handleCallback`'s redirect to the absolute `${deps.webUrl}/discovery/new`. (2) Added a `withErrorHandling` wrapper in `discovery-proxy-routes.ts` (mirroring `apps/orchestrator`'s existing `discovery-routes.ts` pattern in shape, but returning 502 not 400 — the failure is this gateway's upstream, not the client's fault) and wrapped all four exported handlers' bodies in it. Added a regression test (`discovery-proxy-routes.spec.ts`, "when orchestrator returns a non-JSON response") using a real HTTP server that always answers with HTML, asserting a 502 and that the server survives to answer a second request. Nothing else touched.

**Alternatives considered:** Extracting `withErrorHandling` into `packages/http-server-kit` now, since an equivalent already exists in `apps/orchestrator` — rejected for this pass; this is only the pattern's second occurrence, and `CIP-001`'s own instruction not to create reusable abstractions ahead of a clear third use still applies. Left as a candidate for the next extraction round (already noted in a comment on the new `withErrorHandling` function). Also considered deriving `web`'s origin dynamically from the incoming request instead of a `SAF_WEB_URL` env var — rejected because, per `redirectUriFor(req)`'s own established pattern, the inbound `Host` header at `api-gateway` is never `web`'s origin (that's the entire bug), so there is no reliable request-derived value to use; an explicit, independently configured origin is the correct fix.

**Impact:** Full monorepo validation suite re-run clean (build 36/36, typecheck 67/67, test 63/63 — up from 62, lint/format/deps/fitness all clean). Real-browser re-verification via Playwright: full Login → real Keycloak authentication → landing on `http://localhost:3002/discovery/new` (this session's actual `web` port, via `SAF_WEB_URL` override) → real Idea Submission screen rendered, zero console errors. Documented honestly in `10-vs1-exit-gate-report.md` §16 and `BASELINE.md`, since both defects mean Sprint 1's original Exit Gate's "business objective achieved" claim was not actually true at closure — only its *engineering* Definition of Done (code, tests, CI, docs) was.

**Lessons learned:** The two defects were only found together because fixing `ED-012`'s nonce bug was itself required before a real login could ever reach the redirect step at all — each layer of a login flow can hide the next layer's bug until the one in front of it is fixed. This reinforces `ED-012`'s conclusion: real browser/E2E verification is not a "nice to have" polish step for this kind of flow, it is the only thing that actually exercises the seam between `api-gateway` and `web` as two separate origins — a seam no unit or integration test in this project's existing suite touches, because none of them run a browser or treat `web`'s origin as meaningfully different from `api-gateway`'s.

## ED-014: Constitutional Review governance patch (v1.0.1) across AF, PXF, ECS, XLS

**Date:** 2026-07-17

**Affected packages:** none (documentation only) — `docs/architecture/00-vision-and-principles.md` (AF), `docs/ux/00-platform-experience-foundation.md` (PXF), `docs/product/00-engineering-canvas-specification.md` (ECS), `docs/ux/01-experience-language-specification.md` (XLS), `PROJECT_CONTEXT.md`.

**Reason:** A ten-panel Constitutional Review (Distinguished Enterprise Architect / CPO / CXO / Principal Systems Engineer / Design System Architect / Human Factors Specialist / AI Platform Architect / Technical Writer roles) was run across all four constitutional documents before freezing them as v1.0, checking internal consistency, cross-document consistency, constitutional boundaries, missing invariants, governance, terminology, scalability, and future-proofing. It found the documents substantively sound (Constitutional Health Score 84/100, zero Critical findings) but surfaced concrete, checkable governance and terminology defects: ECS asserted a stale, now-false claim about the constitutional set's size ("these three documents") after XLS's addition made it four; AF had no reciprocal awareness of being part of the constitutional set (no Status header, no named owner, no version number, despite PXF/ECS/XLS all declaring AF as their peer); no constitutional precedence or cross-document conflict-resolution rule existed anywhere; only 2 of 4 documents carried an explicit version number, and PXF's own governance section promised versioned amendments for itself with no starting version to revise from; and "Canvas" was used ambiguously in ECS to mean both the whole Engineering Canvas product and, elsewhere, specifically the spatial graph-view — an ambiguity structural to ECS §6's own view-naming table.

**Decision:** Approved for constitutional freeze contingent on a governance patch release (v1.0.1), scoped explicitly to terminology, constitutional governance, and versioning consistency — no conceptual redesign. Applied: (1) added a Status/Governance header and section to AF, naming the Distinguished Enterprise Architect / Principal Systems Engineer function as its owner, giving it its first version number (v1.0.1); (2) versioned PXF as v1.0.1; (3) added an identical Constitutional Precedence and Conflict Resolution clause to all four documents' Governance sections (each document authoritative within its own declared domain; genuine cross-document conflicts escalated jointly to both owning functions and recorded here, never resolved by silently favoring one document); (4) fixed ECS's stale count and replaced every hardcoded enumeration of the constitutional set, across all four documents, with a pointer to `PROJECT_CONTEXT.md`'s canonical list, so no individual document can go stale again when a fifth is ever added; (5) disambiguated "Canvas" throughout ECS and XLS — "the Engineering Canvas" now means the whole product, "Canvas view" (never bare "the Canvas") means specifically the spatial graph-view, and ECS §3's workspace object formerly named "Canvas" is renamed "Canvas Session" to remove the third overloaded sense; (6) renamed XLS §21 "Workspace Shell Language" to "Platform Shell Language," since its content governs global, platform-wide chrome, not a per-Workspace surface, and collided with the formally defined Workspace object; (7) trimmed the near-verbatim duplication between PXF §22 (Frontend Engineering Standards) and XLS §37 (React Derivation Rules) — XLS §37 now defers to PXF §22 for the general rules and states only what is specific to XLS's own token categories; (8) added a small cross-reference resolving PXF's own internal "density" ambiguity (§2 vs §18) to XLS §5's formal Reference/Focus model; (9) tightened XLS §2 to cite PXF §1's "senior delivery partner" personality metaphor rather than re-describing it; (10) backfilled each Definition-of-Done/Governance section's "additive to" chain so PXF §25, ECS §15, and XLS §40 correctly reference every sibling document that now exists, not just the ones that existed when each was originally written.

**Alternatives considered:** Creating a fifth, short "Constitutional Charter" document to hold precedence/versioning/enumeration centrally, as the review itself suggested — rejected for this pass as more than the approved "no conceptual redesign" scope calls for; the smaller-footprint fix (identical precedence clauses embedded in each document's existing Governance section, `PROJECT_CONTEXT.md` as the canonical enumeration) resolves the same concrete ambiguities without adding a new constitutional artifact. The review's Medium-severity findings not addressed in this pass (portfolio/cross-project Executive-view aggregation vs. per-project graph isolation; single-owner governance scale at hundreds of contributors; AI agents as consumers, not just producers, of the experience layer; keyboard-first framed as input-modality-specific rather than input-agnostic) were deliberately left open — none is Critical or High, and the review's own instruction was that only Critical/High findings justify changing the documents now.

**Impact:** All four constitutional documents now: carry an explicit version number (AF v1.0.1, PXF v1.0.1, ECS v1.0.1, XLS v1.0.1); state an identical constitutional-precedence/conflict-resolution rule; point to `PROJECT_CONTEXT.md` as the single canonical enumeration of the set rather than each restating a count; and use "Canvas"/"Canvas view"/"Canvas Session" unambiguously. No principle, philosophy statement, checklist item, or Definition-of-Done requirement was altered in substance — verified by diffing each change against the review's explicit High-severity findings list before applying it.

**Lessons learned:** A constitutional set that grows by adding new peer documents over time needs, from the first addition onward, to never let an existing document hardcode a count or enumeration of its siblings — every one of the five governance findings in this patch traces back to that single anti-pattern (stale counts, uneven versioning, ungoverned precedence) recurring independently across three documents. The fix generalizes: point to one canonical index (`PROJECT_CONTEXT.md`) and never restate what it already says.

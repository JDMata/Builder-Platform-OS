# User Journey and Screen Evaluations

Assumption per the review's instruction: a completely new user, empty account, walking through the entire journey from login to an approved project.

## How Sprint 1 scope is marked

Every screen below is tagged:
- **[SPRINT 1]** — real, in the approved backlog ([docs/backlog/sprint-1-backlog.md](../../backlog/sprint-1-backlog.md)), gets the full 15-field evaluation and a UX score.
- **[FUTURE — Sprint N]** — deliberately not built yet, per [PLATFORM_MATURITY.md](../../../PLATFORM_MATURITY.md)'s Official Roadmap. Gets a shorter note confirming the target-state design is coherent and correctly out of scope, not a fabricated full evaluation of a screen that doesn't exist.
- **[GAP]** — asked for by the journey, plausible to need, but currently missing from the approved backlog entirely (neither built nor explicitly planned). Flagged with a recommended minimal fix that does not add a new story.

## The complete target journey, reconciled against Sprint 1's real backlog

```
Login                          [SPRINT 1 — GAP: no login screen story exists yet]
  ↓
Dashboard                       [FUTURE — Sprint 2+: no projects exist yet for a new user, so Sprint 1 has no dashboard shell]
  ↓
Create Project                  [SPRINT 1 — reconciled: Discovery creates the Project as its OUTCOME, not upfront]
  ↓
Choose Project Type             [FUTURE: no "project type" field exists in any aggregate yet; not meaningful with one Platform Pack]
  ↓
Discovery Workshop              [SPRINT 1 — SAF-42, the idea-submission screen]
  ↓
Upload Existing Documentation   [FUTURE — see Document Intelligence Review]
  ↓
AI Requirement Discovery        [SPRINT 1 — SAF-44/45/46/47, the clarification loop]
  ↓
Requirement Confidence          [SPRINT 1 — GAP, cheap addition: derivable from existing data, no new domain field]
  ↓
Project Charter                 [SPRINT 1 — reframing of SAF-50/51's review & approve screen]
  ↓
Timeline                        [FUTURE — no estimation capability exists yet]
  ↓
Cost Estimate                   [FUTURE — no estimation capability exists yet]
  ↓
Risk Assessment                 [FUTURE — Sprint 7, Enterprise Governance]
  ↓
Functional Specification        [FUTURE — Sprint 2, Documentation Factory]
  ↓
Artifact Review                 [SPRINT 1 — part of SAF-51, scoped to Requirements/Acceptance Criteria only]
  ↓
Approval                        [SPRINT 1 — SAF-50/51]
  ↓
Project Ready                   [SPRINT 1 — the Project-created confirmation screen]
```

**This is the single most important finding of this review, stated plainly:** the full journey is a coherent, correctly-sequenced *multi-sprint* target, and Sprint 1's slice through it (Discovery Workshop → Project Ready, with a Login gap to close) is a genuinely complete, valuable, honest vertical slice — not a broken fragment. Timeline, Cost Estimate, Risk Assessment, and Functional Specification being absent from Sprint 1 is **correct**, not a defect: none of them can be produced honestly before Sprint 2+'s generation capabilities exist, and faking them in Sprint 1 would violate the "generated, not decorative" principle this whole platform is built on.

## Create Project — reconciled design decision

The prompt's example journey shows "Create Project" before "Discovery Workshop." Sprint 1's actual design inverts this deliberately: **a `Project` doesn't exist until Discovery produces one, on approval (SAF-50).** This is validated as the *better* product decision, not a gap to fix by adding an upfront "create project" form:

- It matches the "consulting engagement" framing the objective asks for — a consultant doesn't ask you to name and scope a project before understanding what it is; they get there *through* discovery.
- It avoids a shell `Project` with no real content sitting in a dashboard, which is exactly the kind of "partial plumbing" [ENGINEERING_PRINCIPLES.md](../../../ENGINEERING_PRINCIPLES.md)'s Engineering Planning Principles rule out.

**One real bug found reconciling this:** [docs/backlog/sprint-1-backlog.md](../../backlog/sprint-1-backlog.md)'s **SAF-41** described the draft `RequirementDocument` as "scoped to a `Project`'s workspace" — impossible, since no `Project` exists at that point. It should be scoped to a **`Workspace`** directly (the tenant's pre-existing organizational grouping, built in Sprint 0). This is fixed as part of this review — see this folder's [README.md](README.md).

## Screen evaluations

### Login [SPRINT 1 — GAP]

| Field | Assessment |
|---|---|
| Purpose | Authenticate the user via the platform's existing OIDC federation before any Discovery Workspace screen is reachable. |
| Primary user | Any new or returning user. |
| Business objective | Zero-friction, Zero-Trust-compliant entry — no password ever touches the platform (ADR-0010). |
| Information displayed | Tenant/workspace context if resolvable from the identity provider redirect; otherwise a single "Sign in" action. |
| Primary actions | Sign in (redirects to the configured IdP's Authorization Code + PKCE flow). |
| Secondary actions | None — this screen should not accumulate secondary actions. |
| Navigation | Entry point; on success, redirects to the Discovery Workspace entry (see Dashboard note below), never to a screen the user hasn't earned yet. |
| Dependencies | `apps/api-gateway`'s already-real `handleLogin`/OIDC callback flow (built in Sprint 0) — the backend exists; only the `apps/web` screen that triggers it does not. |
| Generated artifacts | A session (via `saf_session` cookie) — no business artifact. |
| Expected outputs | An authenticated `RequestContext` for every subsequent call. |
| Potential confusion | None if the screen is a single clear action — risk only if it's skipped and users land on a broken page expecting to already be signed in. |
| Potential usability issues | None anticipated; standard OIDC redirect UX. |
| Accessibility | Must be a real, keyboard-operable link/button — not a JS-only redirect with no visible focus target. |
| Future scalability | Multi-IdP tenant branding (per-tenant "Sign in with Entra ID" vs. "Sign in with Okta") is a Future Idea, not needed now — one generic "Sign in" action is correct for Sprint 1. |
| Recommended improvement | **Add this screen.** It's the one genuinely missing piece between "OIDC backend already works" (Sprint 0) and "a real user reaches the Discovery Workspace" (Sprint 1's own stated exit criterion). Recommend folding it into SAF-42 as a one-screen prerequisite, not a new story — it's a static page with one button, not new engineering. |
| **UX score** | **6/10** as currently unplanned; **9/10** once added as recommended (minimal, no new capability, closes a real reachability gap). |

### Dashboard [FUTURE — Sprint 2+]

A brand-new user has zero projects. A dashboard listing "your projects" would show an empty state and nothing else — genuine UI work with zero information to display. **Correctly deferred.** Recommendation: Sprint 1 skips a dashboard shell entirely; a successful login redirects straight to the Discovery Workspace idea-submission screen (SAF-42), which **is** the meaningful landing experience for a user with nothing yet. A real dashboard becomes worth building once there's more than one project to list — naturally, once Sprint 2+ ships and a user can have multiple projects in flight. No gap here; this is the correct MVP shape.

### Discovery Workshop / Idea Submission [SPRINT 1 — SAF-42]

| Field | Assessment |
|---|---|
| Purpose | Capture a raw business idea in the user's own words, starting a Discovery session. |
| Primary user | A business stakeholder with an idea, not necessarily technical. |
| Business objective | Lowest-friction possible entry into Discovery — no form fields to fill beyond describing the idea and picking a workspace. |
| Information displayed | A free-text idea field, a workspace selector. |
| Primary actions | Start Discovery (submits the idea, creates a draft `RequirementDocument`). |
| Secondary actions | None at this screen — deliberately minimal. |
| Navigation | From Login (or, once >1 project exists, from a future Dashboard); proceeds to either the Clarification screen or directly to Review, depending on whether the agent raised any `Clarification`. |
| Dependencies | SAF-39 (domain), SAF-40 (persistence), SAF-41 (use case) — all P0, all upstream of this screen. |
| Generated artifacts | A draft `RequirementDocument`. |
| Expected outputs | A started `WorkflowRun` (SAF-52) in `running` state. |
| Potential confusion | A bare textarea with no guidance risks under-specified ideas — see Discovery Workshop Review for the "consulting workshop, not blank page" recommendation. |
| Potential usability issues | No indication of what makes a "good" idea description; no example/placeholder text currently specified. |
| Accessibility | Textarea needs a real associated `<label>`, not just a placeholder (placeholders disappear on input and fail as the sole label for screen readers). |
| Future scalability | Document upload (see Document Intelligence Review) attaches here as an *additional* input mode later, not a redesign of this screen. |
| Recommended improvement | Add a short example/prompt ("e.g., 'We need a way for warehouse staff to reconcile...'") as placeholder *and* a visually-persistent hint, not placeholder-only, to fix the accessibility issue and the guidance gap in the same change. |
| **UX score** | **8/10** — clean, low-friction, matches the intake context's own design intent; loses points only for the missing guidance/accessibility fix above. |

### AI Requirement Discovery / Clarification Q&A [SPRINT 1 — SAF-44/45/46/47]

| Field | Assessment |
|---|---|
| Purpose | Turn the raw idea into structured `Requirement`s + `AcceptanceCriterion`s, resolving ambiguity through targeted questions rather than silent assumptions. |
| Primary user | The same business stakeholder, now in a back-and-forth with the "consultant." |
| Business objective | Replace a human business analyst's clarifying-question pass with an AI-guided equivalent, without ever guessing where the source material is genuinely ambiguous. |
| Information displayed | Each unresolved `Clarification`'s question text. |
| Primary actions | Answer each clarification, submit. |
| Secondary actions | None currently designed — see recommendation below for a "why are you asking this" affordance. |
| Navigation | Loops back to itself if the next structuring pass raises new clarifications; otherwise proceeds to Project Charter (review & approve). |
| Dependencies | SAF-44 (real agent invocation), SAF-45 (capability resolver), SAF-46 (answer-and-re-structure use case). |
| Generated artifacts | Answered `Clarification` records; updated `Requirement`/`AcceptanceCriterion` entries on the next pass. |
| Expected outputs | Zero remaining unanswered `Clarification`s, or a further round of the same screen. |
| Potential confusion | Without context, "why is it asking this?" is a real risk — a clarification question shown with no link back to the part of the idea that triggered it reads as arbitrary, closer to a static questionnaire than a consulting conversation. |
| Potential usability issues | If many clarifications arrive in one pass, a long undifferentiated list could overwhelm; grouping or one-at-a-time pacing may help but is a presentation choice, not a new backend need. |
| Accessibility | Each question needs its own labelled input, not a numbered list relying on visual position alone (screen readers need the association explicit). |
| Future scalability | The same screen shape holds even if a future Platform Pack (per [ADR-0023](../../adr/0023-platform-kernel-and-platform-pack-architecture.md)) contributes platform-specific clarification patterns — nothing here is SAP-specific to begin with. |
| Recommended improvement | **Quote the relevant fragment of the original idea text next to each clarification** ("You mentioned *discrepancies over a threshold* — ..."). This is a presentation-layer change to SAF-47 (the clarification already carries a question string; showing the idea text it relates to is a UI-only addition, not a new capability) and is the single highest-leverage fix for the "feels like a consultant, not a form" objective. See Discovery Workshop Review. |
| **UX score** | **7/10** as currently scoped; **9/10** with the quoted-context improvement, which is cheap and high-value. |

### Requirement Confidence [SPRINT 1 — GAP, cheap addition]

No numeric or qualitative "confidence" field exists on `Requirement` today, and none should be added as a new persisted domain field for Sprint 1 — that would be new domain modeling mid-review, which this task explicitly rules out. **Recommended minimal addition:** derive a simple, presentation-only confidence badge on the Project Charter / review screen from data that already exists — a `Requirement` with zero `Clarification`s ever raised against it displays "High confidence"; one that had a `Clarification` (even now answered) displays "Clarified" rather than a fabricated numeric score. This requires no schema change, no new capability, and no new story — it's a computed view over SAF-50's existing data, foldable into SAF-51.

**UX score:** 5/10 as an unaddressed gap (the review's own "Requirement Confidence" step has nothing to show); 8/10 with the derived-badge addition above, which costs nothing architecturally.

### Project Charter / Artifact Review / Approval [SPRINT 1 — SAF-50/51, reframed]

| Field | Assessment |
|---|---|
| Purpose | Let the user see everything Discovery produced, understand it as a coherent whole, and approve it into a real `Project`. |
| Primary user | The same stakeholder, now in a decision-making role rather than an intake role. |
| Business objective | The single moment the platform asks for a human commitment — everything upstream is exploratory, this is the gate. |
| Information displayed | Every structured `Requirement` (grouped by kind: business/functional/non-functional), its `AcceptanceCriterion`s, and (per the recommendation above) its confidence badge. |
| Primary actions | Approve & Create Project. |
| Secondary actions | Request Changes (re-opens the clarification loop). |
| Navigation | From the clarification loop once resolved; forward to Project Ready on approval, backward to clarifications on "Request Changes." |
| Dependencies | SAF-50 (approval use case + Project creation + event emission), SAF-49 (Project persistence). |
| Generated artifacts | An `approved` `RequirementDocument`; a new `Project`; a real `requirements.document.captured.v1` event in the outbox. |
| Expected outputs | Exactly one `Project`, referencing the approved document. |
| Potential confusion | Presenting this purely as a data dump ("here are 3 requirements") undersells what actually happened — a real structuring/reasoning pass. |
| Potential usability issues | "Request Changes" needs to be unambiguous about *what* reopens — the whole document, or a specific requirement — currently designed as the whole loop, which is simple and correct for Sprint 1's scope; a per-requirement "Request Changes" is a legitimate Future improvement, not needed now. |
| Accessibility | Structured content (headings per requirement, not a flat unlabelled block) so screen-reader users get the same grouped structure sighted users see. |
| Future scalability | This is exactly where Sprint 2's Functional Specification, Sprint 5's Timeline/Cost, and Sprint 7's Risk Register will each add their own section once they exist — the screen's list-of-sections shape already accommodates that without a redesign. |
| Recommended improvement | **Frame this screen explicitly as a "Project Charter"** in its copy/title, not a generic "Review requirements" label — same data, but framed as the consulting-deliverable it actually is. Zero architecture change; a labeling/content decision. See Enterprise Product Assessment. |
| **UX score** | **8/10** — the data and gating logic are right; the "Project Charter" framing improvement is what takes it from "requirements review form" to "consulting deliverable." |

### Project Ready [SPRINT 1 — confirmation screen]

| Field | Assessment |
|---|---|
| Purpose | Confirm the outcome and set expectations for what comes next. |
| Primary user | The same stakeholder, now with a real, created `Project`. |
| Business objective | Close the loop with a concrete, inspectable result — not a vague "success" toast. |
| Information displayed | Project name, id, workspace, linked requirement count, discovery-session status. |
| Primary actions | View Project (currently a dead end beyond this screen — no Project Workspace exists yet). |
| Secondary actions | None. |
| Navigation | Terminal screen for Sprint 1. |
| Dependencies | SAF-50 (Project creation), SAF-53 (proves this whole path end to end). |
| Generated artifacts | None new — confirms what SAF-50 already produced. |
| Expected outputs | User understands Discovery is complete and a real Project exists. |
| Potential confusion | "View Project" leading nowhere meaningful risks feeling like a dead end rather than a beginning. |
| Potential usability issues | None beyond the above. |
| Accessibility | Standard confirmation-screen requirements (clear heading, no information conveyed by color alone). |
| Future scalability | Becomes the entry point *into* the real Project Workspace once Sprint 2+ builds one — see Project Workspace Review. |
| Recommended improvement | Add a short, static "What happens next" panel — plain text, no new capability — previewing that Sprint 2+ will generate documentation and applications from this Project. This is copy only, and it's what turns "dead end" into "beginning of an engagement," directly serving the Enterprise Product Assessment's concern about feeling like a real platform rather than a one-shot tool. |
| **UX score** | **7/10** as currently scoped; **9/10** with the "what happens next" addition, which is copy-only. |

## Future-state screens (evaluated for coherence, not built)

| Screen | Sprint | Why correctly deferred |
|---|---|---|
| Choose Project Type | — | No "project type" field exists in any aggregate; meaningless with a single Platform Pack (SAP). Revisit once a second Platform Pack ([ADR-0023](../../adr/0023-platform-kernel-and-platform-pack-architecture.md)) makes "type" a real choice. |
| Upload Existing Documentation | Future (Document Intelligence) | See [04-document-intelligence-review.md](04-document-intelligence-review.md) — no extraction/gap-analysis capability exists yet; adding upload without it would collect files nothing reads. |
| Timeline | Future (likely Sprint 5+) | No estimation capability or domain model exists; faking a timeline would be actively dishonest, not a UX shortcut. |
| Cost Estimate | Future (likely Sprint 5+) | Same reasoning as Timeline. |
| Risk Assessment | Sprint 7 (Enterprise Governance) | `Risk` aggregate exists in the Governance context, but no Discovery-time risk-assessment capability is built; correctly scoped to Sprint 7 per [PLATFORM_MATURITY.md](../../../PLATFORM_MATURITY.md). |
| Functional Specification | Sprint 2 (Documentation Factory) | This is Sprint 2's entire theme; Sprint 1 correctly stops at approved requirements, one step before FS generation. |

None of the above is recommended for Sprint 1. Each is confirmed as a coherent next step once its owning sprint's capability actually exists.

# Builder Platform OS — Experience Realization Package

**Board:** Builder Platform OS Product Experience Board.
**Status:** Sprint 4 implementation blueprint — not a specification. [01-experience-realization-charter.md](01-experience-realization-charter.md) and [02-design-system-foundation.md](02-design-system-foundation.md) are treated as immutable references throughout; nothing here restates them except where necessary to explain an implementation decision.
**Purpose:** the blueprint the Builder Platform OS Figma project is built from — every implementation decision required before Figma construction begins, organized for a UX Designer and Frontend Engineer to act on immediately.

---

## Part 1 — Implementation Roadmap

| Day | Activity | Purpose | Dependencies | Expected Output | Complexity | Owner |
|---|---|---|---|---|---|---|
| 1 | Figma workspace architecture setup (Part 2) | Establish the container every later asset lives in | None | An empty, structured Figma project — pages, libraries, collections named, nothing populated | Low | Principal Design System Architect |
| 2–3 | Token realization (Part 3) | Turn the Design System's token taxonomy into real Figma Variables | Day 1 | Primitive/Semantic/Component variable collections, light+dark modes | Medium | Design System Architect, with Frontend Architect review |
| 4 | Foundations components (type styles, icon set, material/elevation surfaces) | The base every other component composes from | Day 2–3 | A published Foundations library | Low–Medium | Principal Product Designer |
| 5–7 | Component Realization, Wave 1 (Part 4) | Inputs, Forms, Feedback, Dialogs, Overlays, Navigation | Day 4 | Component Sets with full state coverage | Medium | Product Designer, Frontend Architect reviews properties |
| 8–9 | Component Realization, Wave 2 | AI Interaction, Data Display, Tables, Workflow | Day 5–7 | Component Sets with full state coverage | Medium | Product Designer |
| 10–11 | Discovery Screen Realization (Part 5) | Reconcile the five shipped screens against the new library | Day 8–9 | A reconciled Figma page per screen, deviations logged | Medium | UX Architect, Product Designer |
| 12–13 | Engineering Canvas Shell Realization (Part 6) | Structural scaffold only — Platform Shell, Inspector, Canvas Container | Day 4 (Foundations only) | Structural frames, no graph content | Medium–High | UX Architect, Frontend Architect |
| 14–15 | Prototype construction (Part 7) | A clickable, behaviorally accurate prototype of the primary journey | Day 10–11 | Figma prototype | Medium | Product Designer |
| 16 | Design QA pass (Part 8) | Validate tokens, components, interaction, accessibility, consistency | All prior days | A QA record, pass/fail per check | Medium | Principal Accessibility Specialist, Design System Architect |
| 17 | Engineering handoff assembly (Part 9) | Package everything the UX Team needs to begin real React work | Day 16 | The handoff note the Charter's own Deliverable 6 requires | Low | Frontend Architect |

---

## Part 2 — Figma Project Architecture

| Element | Specification | Why |
|---|---|---|
| Pages | One page per Design System Foundation Part 3 category (Foundations, Inputs, Navigation, Feedback, Layout, AI Interaction, Data Display, Workflow, Canvas, Inspector, Dialogs, Overlays, Tables, Forms), plus **Discovery Screens**, **Prototypes**, **Documentation**, **Review (WIP)**, **Archive** | Mirrors the taxonomy exactly — a designer looking for "where does the confidence indicator live" finds it by category, not by guessing |
| Sections | One section per component within its page | Keeps a page navigable as its component count grows |
| Libraries | Two published libraries: **Foundations** (tokens, type, icon) and **Components** (everything built from Foundations) | Matches PXF §16's own token/component separation exactly |
| Variable Collections | Primitive, Semantic, Component — three collections, not one flat list | Direct implementation of PXF §16's three-layer model |
| Component Collections | One Component Set per component named in Design System Foundation Part 3, variants = the state set in Part 4 | No state omitted, none invented beyond the specified set |
| Shared Assets | The icon set, sized against the type scale | XLS §17 |
| Documentation Areas | One frame per component citing its Design System Foundation traceability row | So fidelity is checkable inside Figma, never requiring a separate lookup |
| Review Areas | A dedicated **Review (WIP)** page — in-progress component work lives here until it passes Design Review | WIP never leaks into the consumable library, avoiding an unreviewed component being accidentally used |
| Archive Areas | A dedicated **Archive** page — deprecated/superseded components move here, never deleted | Consistent, by extension rather than by direct citation, with this platform's own "never hard-delete a referenced object" discipline (CMM Part 6) — an analogy for design assets, not a claim that CMM itself governs Figma files |
| Versioning strategy | Numbered library publishes (v1.0, v1.0.1, …), matching the exact convention XLS/PXF already use for themselves | One convention across constitutional documents and their derived design artifacts |
| Branching strategy | Figma branches for in-progress component work, merged to the main library only after passing Design Review | Mirrors `PROJECT_PLAYBOOK.md`'s PR/branch/review/merge discipline, applied to design assets rather than code |
| Naming conventions | Identical strings to the token/component names in Design System Foundation Parts 2–3 — no translation layer | Design System Foundation §8's own rule, applied |
| Folder organization | Pages are the top-level unit; no folder layer beneath them beyond Sections | Figma's own page/section model is sufficient; no additional structure invents complexity the tool doesn't need |

---

## Part 3 — Token Realization

| Concern | Implementation |
|---|---|
| Variable Collections | Three: **Primitive**, **Semantic**, **Component** — one Figma Variable per token named in Design System Foundation Part 2 |
| Token hierarchy | Component variables reference Semantic variables; Semantic variables reference Primitive variables. **No Component variable ever references a Primitive variable directly** — this is the one rule every later validation pass checks first |
| Primitive tokens | Raw values — **not assigned here**, since none is defined in XLS; the Primitive collection's *structure* (one slot per category from Design System Foundation Part 2) is fully specified, its *values* are a **[GAP]** requiring a Product Designer's first real visual decision, checked against XLS's principles (restraint, small palette, WCAG contrast) at Design QA (Part 8), not against a prescribed number |
| Semantic tokens | One per role named in Design System Foundation Part 2 (`color-action-primary`, `type-body`, `elevation-raised`, …) | 
| Component tokens | Created only when a specific component genuinely needs a value distinct from its semantic default — never speculatively | 
| Light/Dark strategy | Two independently-tuned value sets per Semantic token (XLS §32 — dark mode is not a mechanical inversion of light), organized as Figma's per-collection mode feature | 
| Inheritance strategy | Strict three-layer resolution, no skipping | 
| Migration strategy | Not a special process — this is what tokens are *for*: a changed Semantic value propagates to every Component token and every component instance automatically, with zero per-component edits (PXF §16's own stated reason for the layering) | 
| Validation process | Every Design Review checks: does any layer/instance reference a raw value instead of a variable? (XLS §36.2) — a fail here blocks that component's publish, not a style note |

---

## Part 4 — Component Realization

Organized into implementation waves, matching Design System Foundation Part 10's Ready Now / Needs Sprint 5 / Needs Sprint 6+ classification.

### Wave 1 — Foundations & core interaction primitives
*Text field, select, checkbox, radio, button, notification, inline validation message, confirmation dialog, translucent-overlay contextual surface (command palette shell), Platform Shell chrome, process-position indicator.*

| Field | Specification |
|---|---|
| Implementation priority | Highest — every later screen and component composes from these |
| Dependencies | Token Realization (Part 3) complete |
| Variants | Full state set from Design System Foundation Part 4 (default/hover/focus/active/disabled/loading/error, plus empty/success where applicable) |
| Properties | Text content, icon slot (instance-swap), boolean visibility toggles for optional elements — no property invented beyond what a component's specified states require |
| Auto-layout expectations | Every component uses auto-layout resized against the Spacing token scale — no manual pixel positioning |
| Composition rules | Built from Foundations only; a component needing something Foundations doesn't provide is a signal to extend Foundations, not to hardcode (PXF §15) |
| Accessibility verification | Keyboard reachability and visible focus state checked per component, not deferred to screen-level QA |
| Reuse expectations | These are the components every other wave composes with — changes here are the highest-blast-radius review class |
| Documentation requirements | Constitutional citation frame per component (Design System Foundation traceability) |
| Testing expectations | Full state-set screenshot per component, verified against Part 8's QA checklist |

### Wave 2 — AI Interaction, Data Display, Tables, Workflow
*Suggestion panel, confidence indicator, provenance display, clarification prompt, card, table, Guided-flow step container.*

Same fields as Wave 1, with two differences: **Dependencies** — Wave 1 complete; **Implementation priority** — high, because Discovery's existing Clarification and Project Charter screens already exercise these patterns in production and need them reconciled now, not deferred.

### Wave 3 — Structural scaffolds (Canvas, Inspector, Platform Shell detail)
*Canvas Container frame, Inspector header/content/actions structure, global navigation detail, status area, notification stack.*

Same fields, with: **Dependencies** — Wave 1–2 complete; **Implementation priority** — medium; explicitly **structure only** — no real node/edge content, per the Charter's Out-of-Scope boundary and Design System Foundation's own Sprint 6+ classification for real Canvas content.

---

## Part 5 — Discovery Screen Realization

| Screen | Components required | Tokens consumed | Reusable patterns | Unique patterns | Accessibility review | Outstanding GAPs | Reuse opportunities | Priority |
|---|---|---|---|---|---|---|---|---|
| **Login** | Text field ×2, primary button, inline validation message | Color (action-primary, semantic danger), Typography, Spacing | Text field, button — used everywhere downstream | OIDC redirect handling (a flow behavior, not a component) | Label association, focus order, error announcement | None found | Text field/button pattern reused on every later screen | **High** — simplest screen, validates the whole component chain first |
| **Idea Submission** | Textarea (Forms), workspace display (Data Display), primary button | Same core set | Form pattern extends directly from Login | Long-form textarea input | Textarea labeling, focus retention on submit | Real workspace selector — already disclosed as `CI-B8` ("a fixed single workspace, not a real selector"); not this package's problem to invent | Form pattern | **High** |
| **Clarification** | Clarification prompt (AI Interaction), answer input (Forms), inline feedback | Core set + AI-provenance semantic | Form input pattern | The bounded AI Q&A loop | Live-region announcement that a new AI-generated question appeared — **flagged for explicit QA verification, not assumed**, since no document confirms this was implemented | None beyond the QA-verification item above | AI Interaction pattern reused on Project Charter | **High** — most directly exercises AI Interaction components |
| **Project Charter** | Structured requirement card (Data Display), confidence indicator, provenance display, human approval control (Dialogs) | Core set + full AI-provenance semantic + success | Card, button | The richest AI-review surface in the whole product | Confirm-control keyboard operability, confidence indicator non-color-only signaling | `CI-B5` — no "Request Changes" reopen path exists yet; already a named, tracked backlog item, not invented here | Highest — this screen's pattern set is the template for Sprint 5's Documentation review screens | **High** — highest validation value of any screen in this package |
| **Project Ready** | Confirmation card, next-step navigation | Core set + semantic success | Card | Minimal — a confirmation state | Success announcement | None found | Lowest of the five | **Medium** — simplest screen, lowest AI-interaction density |

---

## Part 6 — Engineering Canvas Shell Realization

Structure only — **no Graph Runtime functionality is designed here**, consistent with the Charter's Out-of-Scope boundary.

| Element | Blueprint | Note |
|---|---|---|
| Platform Shell | Minimal, quiet global chrome per XLS §21 — near-neutral-only, reserving accent/semantic color for content it frames | |
| Global Navigation | Which tenant, which Workspace, help — the small, stable set PXF §8 names, never growing with feature count | |
| Toolbar | Contextual to the active Lifecycle Workspace/view, not global | |
| **Breadcrumbs** | **Reinterpreted, not implemented as requested.** PXF §8 explicitly rejects a hierarchical sitemap-style trail — "closer to a wizard's step indicator than a sitemap." What this package builds instead is the **process-position indicator** already named in Design System Foundation's Navigation category. Building literal breadcrumbs would directly contradict PXF §8, not merely omit a nice-to-have | A precise correction, not an invented substitute — same discipline as the earlier Workspace/Canvas and Delivery/Deployment-Provider corrections |
| Status Area | Executive-view-adjacent honest signals (ECS §6) — structure only, no real aggregated data yet | |
| Command Palette | The keyboard-first answer to "how do I do X" (ECS §9.2) — structural shell now, full action registry once real actions exist | |
| Canvas Container | The frame that will host the Canvas view (ECS §6) — empty structure, no node/edge rendering | |
| Inspector | Header/content/actions structure (ECS §10, XLS §22) — no real node content | |
| Context Panels | Treated as equivalent to the Inspector unless a distinct concept is intended — no document names "Context Panels" as separate from Inspector; **[GAP]** if a distinct meaning was intended | |
| Notifications | The fixed taxonomy (XLS §30) — informational/success/warning/error/AI-proposal, never an accumulating feed | |
| AI Presence | Proportional only — visible where AI is actually contributing, absent everywhere else (PXF §9.2) | |
| Keyboard Shortcuts | Full parity with every pointer action (ECS §9.1); the Command Palette is the discoverable surface for them, not a hidden cheat-sheet | |

---

## Part 7 — Prototype Strategy

| Concern | Answer |
|---|---|
| Prototype hierarchy | One primary prototype; everything else is a fragment, not a competing hierarchy |
| Primary user journey | The complete, real Discovery flow: Login → Idea Submission → Clarification → Project Charter → Project Ready — the only journey with real, shipped behavior to be faithful to |
| Secondary user journeys | Platform Shell navigation exploration (structure only); Canvas Container shell exploration (no interaction, since no graph data exists) |
| Validation scenarios | The happy path (idea to confirmed charter); the AI-proposal-rejection path — **this scenario will surface `CI-B5`'s known gap rather than paper over it**, since no reopen path exists to prototype faithfully yet |
| Review checkpoints | Per the Charter's own cadence — token milestone, component milestone, closing Product Design Review |
| Stakeholder demonstrations | Reuses the existing demonstration pattern (`tools/sprint1-demo`'s precedent) rather than inventing a new one |
| Expected completion order | Login → Idea Submission → Clarification → Project Charter → Project Ready, then Platform Shell chrome wrapped around the completed flow |

---

## Part 8 — Design QA Strategy

| Validation | Check |
|---|---|
| Token validation | Zero raw values outside the Primitive collection; every Component/Semantic reference resolves correctly through the hierarchy (Part 3) |
| Component validation | Full state coverage present for every published component (Design System Foundation Part 4) |
| Interaction validation | A keyboard-only walkthrough of the primary prototype completes every step without a pointer |
| Accessibility validation | WCAG 2.2 AA — screen-reader content order matches visual order; the Clarification screen's live-region behavior (Part 5) is explicitly re-verified, not assumed |
| Prototype validation | Matches the real, shipped Discovery flow's actual behavior; any intentional difference is a recorded deviation, not a silent improvement (Design Governance, Charter) |
| Consistency validation | A Design Constitution Check re-run at this package's own closure, identical in method to Design System Foundation Part 12 |
| Regression strategy | Any change proposed to an already-shipped Discovery screen is checked against not silently altering its real production behavior without a recorded deviation |
| Acceptance criteria | PXF §25 / ECS §15 / XLS §40's Definitions of Done, additive, unchanged, applied per artifact |

---

## Part 9 — Engineering Alignment

| Deliverable | React dependency | Frontend dependency | Backend dependency | API dependency | Mock-data dependency | CMM dependency | Sprint dependency | Engineering risk |
|---|---|---|---|---|---|---|---|---|
| Foundations tokens | UX Team | `apps/web` theme layer | None | None | None | None | Ready Now | Low |
| Wave 1 components | UX Team | `apps/web` | None (Login/Idea Submission already real) | Real (Discovery's shipped endpoints) | None | `RequirementDocument` | Ready Now | Low |
| Wave 2 components | UX Team | `apps/web` | Partial (Clarification/Project Charter real; Documentation-equivalent not yet) | Real for Discovery; mocked for anything Documentation-shaped | `Requirement`, `Artifact` shapes (CMM) | `Requirement`, `Decision`, `Artifact` | Ready Now (Discovery); Needs Sprint 5 (Documentation) | Low for Discovery; Medium for Documentation until CAP-003/004 ship |
| Wave 3 (Canvas/Inspector shell) | UX Team | `apps/web` | None yet | None yet | Structural only, no data | `DigitalTwinNode`/`Edge` (structure, not content) | Needs Sprint 6+ (Graph Runtime) | Building ahead of real data risks throwaway rework if the Graph Runtime's actual shape shifts during Sprint 6 |
| Discovery reconciliation | UX Team | `apps/web` | None (already real) | Real | None | `RequirementDocument`, `Requirement`, `Clarification` | Ready Now | Low — this is re-validating shipped code, not building new |

---

## Part 10 — Implementation Backlog

| # | Task | Priority | Dependencies | Owner | Deliverable | Definition of Done | Exit Criteria | Risk | Effort |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Figma workspace setup | Critical | None | Design System Architect | Structured, empty Figma project (Part 2) | Matches Part 2's specification exactly | Board sign-off | Low | XS |
| 2 | Token realization | Critical | #1 | Design System Architect | Variable collections (Part 3) | Zero raw values outside Primitive | Passes token validation (Part 8) | Low | S |
| 3 | Wave 1 components | High | #2 | Product Designer | Component Sets, full states | Full state coverage, accessibility-verified | Passes component validation | Low | M |
| 4 | Wave 2 components | High | #3 | Product Designer | Component Sets, full states | Same | Same | Low | M |
| 5 | Wave 3 structural scaffolds | Medium | #3 | UX Architect + Frontend Architect | Structural frames (Part 6) | Structure only, no invented Graph Runtime content | Board confirms no scope creep into Sprint 6 | Medium (throwaway-rework risk, Part 9) | M |
| 6 | Discovery screen reconciliation | High | #3, #4 | UX Architect | Reconciled Figma pages, deviations logged | Every screen checked against PXF §24/XLS §39 | Pass or explicit recorded deviation, none silent | Low | M |
| 7 | Prototype construction | High | #6 | Product Designer | Clickable prototype | Behaviorally accurate to real shipped flow | Passes prototype validation | Low | S |
| 8 | Design QA pass | Critical | #2–#7 | Accessibility Specialist + Design System Architect | QA record | Every Part 8 check run and recorded | Zero unresolved "must"-tier failure | Low | S |
| 9 | Engineering handoff assembly | High | #8 | Frontend Architect | Handoff note (Charter Deliverable 6) | UX Team confirms it can begin implementation from this package alone | UX Team sign-off | Low | XS |

---

## Part 11 — Sprint Progress Assessment

| Dimension | Score | Rationale |
|---|---|---|
| Experience Realization | 88/100 | Every implementation decision this package could make has been made; the only open items are genuine, disclosed gaps (Primitive token values, "Context Panels" ambiguity) |
| Design System Implementation | 82/100 | The blueprint for implementation is complete; actual Figma artifacts do not exist yet — that is this package's stated next step, not a shortfall of this package |
| Component Readiness | 85/100 | Every component has a wave, a priority, and a full specification; none is ready as *built* yet |
| Prototype Readiness | 80/100 | The prototype hierarchy and validation scenarios are fully planned, including the honest inclusion of a scenario that will surface `CI-B5`'s known gap rather than avoid it |
| Engineering Readiness | 87/100 | Part 9's dependency table gives Sprint 5 engineers an immediately actionable map of what's Ready Now vs. blocked |
| Accessibility Readiness | 84/100 | Every screen and component has a named accessibility check; one (the Clarification live-region behavior) is explicitly flagged as unverified rather than assumed passing |
| Implementation Confidence | 83/100 | High for Wave 1–2 (matches Discovery's already-shipped precedent); Medium for Wave 3, honestly, given the throwaway-rework risk noted in Part 9 |
| **Overall Sprint 4 Progress** | **85/100** | The implementation blueprint is complete and internally consistent; Sprint 4's next work package is building against it, not specifying further |

---

## Part 12 — Next Work Package Recommendation

**Recommended: Wave 1 Figma Construction** — the first real, populated Figma artifacts (Part 1, Days 1–7).

| Field | Detail |
|---|---|
| Objective | Produce the real Figma Variable collections (Part 3) and Wave 1 component library (Part 4) — the first artifacts this whole Sprint 4 arc has been building toward |
| Expected Deliverables | Published Foundations library; Wave 1 Component Sets with full state coverage; the first populated Documentation Areas |
| Dependencies | This package (Experience Realization Package) approved as the authoritative blueprint |
| Success Criteria | Every Wave 1 component passes Part 8's token and component validation before publish |
| Implementation Risks | Primitive token values are a genuine, disclosed **[GAP]** (Part 3) — the Product Designer's first real visual decision, to be checked against XLS's restraint/contrast principles at QA, not against a number this package could have supplied |
| Readiness to Proceed | High — every dependency this wave needs (workspace architecture, token structure, component specification) is already resolved by this package |

## Recommendation

# Proceed to the next Sprint 4 work package

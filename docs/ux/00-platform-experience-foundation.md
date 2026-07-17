# 00 — Platform Experience Foundation (PXF v1.0.1)

**Status:** Constitutional — governs UX for the life of the platform, on the same footing as [docs/architecture/00-vision-and-principles.md](../architecture/00-vision-and-principles.md) (Architecture Foundation, "AF") and every other document since declared its peer. See [PROJECT_CONTEXT.md](../../PROJECT_CONTEXT.md)'s "Constitutional documents" section for the current, authoritative enumeration of that set — this document does not restate a count or list of siblings inline, since either would go stale the next time a document is added.
**Authored as:** Chief Experience Officer / Enterprise UX Architect / Design System Architect function.
**Scope:** Every screen, workflow, interaction, and component built on this platform, present and future.
**Explicitly not in scope:** screen designs, wireframes, Figma files, React components, Tailwind configuration. Those are downstream artifacts that must be *derivable* from this document — if a mockup can't be justified by a principle in here, the mockup is wrong, not the principle.

## How to read this document

[docs/architecture/00-vision-and-principles.md](../architecture/00-vision-and-principles.md) answers "how is the system built so it survives ten years of engineering change?" This document answers the same question for experience: "how does the product feel and behave so it survives ten years of feature growth without becoming what it was built not to be?"

Every section below distinguishes, explicitly, between:
- **Timeless principle** — justified from first principles (cognitive load, enterprise trust, accessibility law, information theory). Not expected to change on any reasonable time horizon.
- **Current inspiration** — a specific system (Fiori Horizon, Apple HIG, a current visual trend) that happens to express a timeless principle well *today*. Named so a future team can replace the inspiration without violating the principle, and so nobody mistakes "what SAP Horizon looks like in 2026" for a rule.

Where this document says "must," it is binding on every Vertical Slice's Product Design Review, the same way [00-vision-and-principles.md](../architecture/00-vision-and-principles.md)'s non-negotiable principles bind every ADR. Where it says "should," it is a strong default that requires a stated reason to depart from, recorded the same way an architecture deviation would be — see §23 (UX Governance).

---

## 1. Experience Vision

The platform's job is to make an enterprise idea, submitted by one person in one sitting, arrive as a reviewed, structured, delivery-ready artifact — without that person ever having to learn the platform's internal model of how it got there.

The product should feel like working alongside a **senior delivery partner who has already done this a thousand times**: someone who asks exactly the clarifying questions a project needs and no more, who shows their reasoning when it matters and stays out of the way when it doesn't, who never loses your place, and who never asks you to do work the system could reasonably have done itself.

**Ten-year framing.** The same test [00-vision-and-principles.md](../architecture/00-vision-and-principles.md) applies to architecture applies here: *would a designer who joins this team in year five understand why the product feels the way it does, and be able to extend it without breaking that feeling?* This rules out any experience decision whose justification is "it looked good in the demo" — every decision in this document is justified from either enterprise usability research, accessibility law, or a named first principle, not from taste.

The vision is not "an AI tool." The vision is **a calm, structured, trustworthy delivery workspace that happens to use AI where AI is the right tool for the step** — never the reverse.

---

## 2. Product Philosophy

| Philosophy statement | What it rules out |
|---|---|
| The platform is a **collaborator**, not a control panel | UI built around exposing system state (dashboards, admin panels) rather than around advancing the user's actual task |
| **One primary path at a time** | Screens offering many equally-weighted options with no implied next step |
| **Depth over density** | Cramming every possible field/action onto one screen instead of sequencing them |
| **The system remembers so the user doesn't have to** | Re-asking for information already captured; work that can't be resumed exactly where it was left |
| **Trust is earned by predictability, not by flourish** | Novel interaction patterns invented for their own sake; delight mechanics that mask uncertainty about what happened |
| **Every AI action is a proposal until a human confirms it** | Silent AI-driven state changes with no visible confirmation step |

This is a direct, deliberate rejection of three failure modes named in the brief: the **dashboard-heavy** enterprise tool (state exposed for its own sake), the **chat wrapper** (a raw conversation log standing in for a product), and the **traditional ERP** (menu trees standing in for information architecture). All three are symptoms of the same underlying mistake: designing around what the *system* can show, instead of what the *user* is trying to accomplish next. Every principle in this document traces back to avoiding that mistake.

"Depth over density" here means never cramming a screen's fields/actions together instead of sequencing them — a distinct sense from the legitimate scanning density named in §18 and formalized as the Reference/Focus density model in the Experience Language Specification (XLS §5); the two are not in tension, and XLS §5 is the canonical resolution if the two ever read as conflicting in isolation.

---

## 3. Emotional Design Goals

| Target feeling | Produced by | Actively destroyed by |
|---|---|---|
| **Confidence** | Clear next step always visible; irreversible actions always confirmed explicitly | Ambiguous button labels; silent failures; state that can't be verified |
| **Clarity** | One primary action per screen; typographic hierarchy; short, direct copy | Competing calls to action; jargon; walls of undifferentiated text |
| **Intelligence** | AI output shown with visible reasoning/confidence, not just an answer | AI presented as an oracle with no visible basis for its output |
| **Trust** | Consistent patterns across the whole platform; predictable outcomes for identical actions | Novel interaction patterns per screen; inconsistent terminology for the same concept |
| **Calm** | Generous whitespace; restrained color; motion only where it communicates state | Visual noise; competing colors/badges; unnecessary animation |
| **Flow** | Progressive disclosure; no unnecessary confirmation steps; resumable work | Interruptive modals; forced context switches; lost scroll/input state |
| **Professional excellence** | Consistent, restrained visual language; enterprise-appropriate density and tone | Playful mascots, gimmicks, or consumer-app affordances applied to enterprise work |

The explicit anti-list from the brief — **busy, gimmicky, toy-like, dashboard-heavy, menu-driven, chat wrapper, traditional ERP** — is the negative space this document designs against. Each later section (Navigation Model, AI Interaction Model, Visual Language, Motion) states directly which of its principles exist specifically to prevent one of these seven failure modes.

---

## 4. User Personas

These are **directional personas**, derived from the platform's actual known usage pattern (Discovery Workspace, Sprint 1) and its declared roadmap (documentation and artifact generation, Sprint 2+) — not from formal user research, which has not been conducted. They exist to give later design decisions a concrete "who is this for" anchor, not to be treated as validated research. Re-validate against real users at the first opportunity; until then, treat every persona-driven decision as a stated assumption, not a fact.

| Persona | Role in the platform | What they need from the experience |
|---|---|---|
| **The Business Sponsor** | Submits the original idea; owns the business outcome | To express intent in their own words, get it reflected back accurately, and trust that nothing was lost or invented in translation |
| **The Delivery Lead** | Reviews and confirms structured requirements/charters before they proceed | To assess completeness and correctness quickly, without re-reading the entire idea from scratch; needs confidence signals, not raw AI output |
| **The Solution/Enterprise Architect** | Consumes generated artifacts (Sprint 2+: specs, architecture docs) as the source of truth for downstream delivery | Traceability — every generated artifact must be able to show what requirement it came from and why |
| **The Platform Operator** | Manages workspaces, tenants, and platform configuration (not yet built, but implied by the multi-tenant architecture) | Predictable, low-frequency administrative interactions that stay out of the way of the primary delivery flow |
| **The Executive Stakeholder** | Occasional, high-level visibility into project status; not a daily user | A small number of trustworthy, honest status signals — never a dashboard to interpret |

A recurring pattern across all five: **none of them are a "power user" chatting all day.** Every persona touches the platform in bounded, purposeful sessions to move a specific piece of work forward. This is the strongest argument in this document against a chat-first design (§9) — the personas' actual need is task completion, not conversation.

---

## 5. User Journey Principles

1. **A journey is one continuous thread, not a set of disconnected screens.** Every screen shows the user where they are within the larger journey, not just its own local state.
2. **The system never asks for information it already has.** If a prior step captured it, later steps inherit it silently.
3. **Every journey is resumable.** Closing the browser, losing network, or coming back the next day must return the user to exactly where they left off, not to a landing page.
4. **There is always a clear next action.** A screen with no obvious next step is a defect, not a "clean minimal" design.
5. **Irreversible steps are always distinguished from reversible ones**, visually and behaviorally — confirmation friction should be proportional to how hard an action is to undo.
6. **Clarification is bounded, not open-ended.** When the system needs more from the user (e.g., a clarification loop), it asks a finite, visible number of specific questions — never an unbounded free-form back-and-forth standing in for a workflow.
7. **The journey ends at a real, durable artifact** (an approved requirement, a generated document, a delivered project) **— never at "done chatting."**

---

## 6. Information Architecture

The platform's information architecture is a **hierarchy of durable objects**, not a tree of menus or a list of chat threads:

```
Tenant
 └─ Workspace                (a durable, named context for one line of work)
     └─ Project / Run        (one idea's journey from capture to delivery)
         └─ Artifact         (a requirement, charter, document, generated deliverable)
```

**Timeless principle:** information architecture should mirror the *real-world objects the user cares about* (their idea, their project, their document), not the *internal services that happen to produce them.* A user should never need to know that "Discovery," "Structuring," and "Generation" are separate backend contexts — that boundary is an architecture concern (see [04-service-boundaries.md](../architecture/04-service-boundaries.md)), not a navigation concern.

This directly rules out two of the named anti-patterns:
- **Menu-driven** IA (a tree of feature-named pages) is rejected because features aren't what users are trying to find — their *work* is.
- **Dashboard-heavy** IA (a grid of status widgets as the home screen) is rejected because a dashboard answers "what is the state of everything," which is an operator's question, not the primary persona's question ("where is my work, and what's next").

---

## 7. Workspace Philosophy

The **Workspace** — not a dashboard, not a chat window — is the platform's central metaphor: a persistent, evolving container for one coherent line of work, holding its own history, its own artifacts, and its own state, always resumable exactly where it was left.

Why a workspace and not a dashboard: a dashboard is built to be *monitored*; a workspace is built to be *worked in*. This platform's primary personas (§4) are doing work, not supervising a system, so the primary object on screen at all times should be the thing they're working *on*, not a summary of everything that exists.

Why a workspace and not a chat thread: a chat thread has one dimension — time, scrolling down. A real piece of delivery work has structure — requirements, clarifications, decisions, artifacts, all related to each other, not just sequential. A workspace can present that structure; a chat log can only imply it through re-reading scrollback. This is the core argument against the platform ever collapsing into a "chat wrapper" as it grows: **AI is a capability invoked within a workspace, not a workspace's entire interface** (expanded in §9).

---

## 8. Navigation Model

- **Minimal, stable global navigation** — the small number of things that are always true (which tenant, which workspace, how to get help) — never grows as features are added.
- **All work-specific navigation is contextual**, scoped to the current Workspace/Project, and disappears when you leave it. Feature growth must never inflate the *global* navigation surface.
- **Progress within a journey is shown as a process position, not a page in a menu tree** — closer to a wizard's step indicator than a sitemap. The user should always be able to answer "how far along am I" by glancing at the same place on every screen.
- **No more than two levels of navigational depth** should ever be required to reach any piece of active work. If a third level becomes necessary, that is a signal the information architecture (§6) needs to change, not that navigation needs a new submenu.

This is the direct rule against the platform becoming **menu-driven**: navigation exists to move *within* one piece of work, not to be a directory of the whole system's feature set.

---

## 9. AI Interaction Model

This is the section that most directly determines whether the platform reads as an AI-native delivery platform or as a "chat wrapper" — the single anti-pattern most existentially threatening to this product's positioning.

**Timeless principles (these do not change as models get better):**

1. **AI proposes, the human disposes.** Every AI-produced artifact — a structured requirement, a clarification question, a generated document — is presented as a reviewable, editable proposal, never as a silently-applied fact. This is the same principle already encoded in the platform's architecture (Project Charter review-and-confirm step, [08-authentication-and-rbac.md](../architecture/08-authentication-and-rbac.md)'s human-approval gates); this document extends it from an architectural rule to an experience rule.
2. **AI presence is proportional to AI's actual contribution at that moment.** When AI has nothing useful to add to a screen, no AI affordance should be visible on it. A persistent chat bubble haunting every screen regardless of relevance is the single clearest symptom of "chat wrapper" design, and is explicitly rejected.
3. **AI output is always structured, never a raw conversational transcript standing in as the product.** Clarification questions are discrete, boundable, and disappear once answered — not accumulated as an ever-scrolling log the user must re-read to understand current state.
4. **Confidence and provenance are shown, not asserted.** Where an AI-produced artifact can meaningfully vary in reliability (e.g., a structured requirement derived from ambiguous prose), the interface shows *why* the system believes what it produced, at a level the reviewing persona (§4, the Delivery Lead) can actually use to decide whether to trust it — not a bare percentage, and not silence.
5. **Every AI interaction has a visible exit.** The user can always stop, override, or bypass an AI-driven step and proceed manually — the AI is an accelerant to a workflow that remains structurally valid without it, not a gate the user is trapped behind.

**Current inspiration, explicitly not doctrine:** today's best expressions of these principles look like inline, structured suggestion cards with accept/edit/reject controls (as already built in Sprint 1's Clarification and Project Charter screens) rather than a chat bubble. As AI interaction patterns mature industry-wide over the next decade, the *expression* of these five principles may change; the principles themselves should not.

---

## 10. Design Principles

| Principle | Justification | What it rules out |
|---|---|---|
| **Clarity over cleverness** | Enterprise users are task-focused, often time-pressured, and frequently not the platform's most frequent user of the week — clever-but-unfamiliar patterns cost more than they charm | Novel widgets invented where a well-understood pattern already exists |
| **Hierarchy over decoration** | Visual weight should map to informational importance (a well-established finding in enterprise usability research going back decades), not to what's easiest to make prominent | Color/size used for visual variety rather than to signal importance |
| **Consistency over novelty** | Every inconsistency is a small tax on the user's mental model, paid every time they encounter it | A different pattern for the same underlying interaction (e.g., three different "confirm" button styles) |
| **Restraint as a design tool** | What's absent from a screen is as deliberate as what's present — restraint is what produces "calm," one of the platform's core target feelings | Adding a feature/badge/indicator because it's possible, not because it's needed at that moment |
| **Calm technology** | The interface should require attention only when attention is genuinely needed (a principle traceable to Mark Weiser's "calm technology," still the clearest first-principles framing decades later) | Notifications, badges, or motion competing for attention outside the user's current task |

---

## 11. Interaction Principles

1. **Predictability first.** The same action produces the same category of result everywhere in the platform.
2. **Reversibility wherever feasible.** Undo is preferred over confirm-then-commit; where an action genuinely cannot be undone, that irreversibility is made visually and verbally explicit before it happens.
3. **Feedback within human perceptual thresholds.** This is a hard constraint grounded in long-standing usability research (Nielsen's response-time thresholds): under ~0.1s reads as instantaneous and needs no feedback; under ~1s needs a lightweight indicator; anything longer needs an explicit, honest progress signal — never a spinner standing in for silence.
4. **Direct manipulation over indirect configuration**, wherever the underlying action is naturally direct (editing text, reordering, approving) — dialogs and settings panels are for genuinely infrequent configuration, not for the core task loop.
5. **Progressive disclosure.** Advanced or infrequently-needed options are available but not upfront; the default view always shows the minimum needed to proceed.
6. **One primary action per screen.** Secondary actions exist, but never compete visually with the one the user came to that screen to take.

---

## 12. Accessibility Principles

Accessibility is a **floor, not a feature** — the same posture the architecture foundation takes toward security (Zero Trust as non-negotiable, not a nice-to-have).

- **WCAG 2.2 Level AA is the non-negotiable minimum** for every screen shipped, with no "we'll fix it later" exception — this is a legal and ethical floor for enterprise software, not a design preference.
- **Full keyboard operability.** Every action reachable by mouse must be reachable by keyboard alone, with a visible, never-suppressed focus indicator.
- **Color is never the sole carrier of meaning.** Status, error, and confidence signals always pair color with text, icon, or shape.
- **Content order matches visual order**, so screen-reader users experience the same information hierarchy sighted users do — this is also, not coincidentally, what makes a layout genuinely clear rather than merely tidy-looking.
- **`prefers-reduced-motion` is respected everywhere motion is used** (expanded in §13).
- **Semantic structure over visual-only structure.** Headings, landmarks, and labels are real, not simulated with styled `div`s — this is a testable, binding requirement, not a style guideline.

---

## 13. Motion Principles

**Timeless principle:** motion exists to communicate a change of state, never as decoration. If a transition can be removed without the user losing any information about what just happened, it should be removed.

- Motion should be **short** (roughly 150–300ms for most UI transitions) — long enough to be perceived as continuous, short enough not to feel like waiting.
- Motion should have **one clear direction and origin** that matches the user's mental model of where something came from or is going (e.g., a panel expanding from the element that triggered it, not a generic fade-in from nowhere).
- **`prefers-reduced-motion` must always be honored** — this is both an accessibility requirement (§12) and evidence that the motion was never load-bearing for meaning, only for polish.
- **No motion for its own sake.** Bounce, elastic overshoot, and other "playful" easing curves are explicitly rejected — they are the fastest route to the "toy-like" feeling this platform must never produce.

**Current inspiration, not doctrine:** today's calm, purposeful motion languages (Apple's HIG motion guidance, Fiori Horizon's restrained transitions) express this well. The specific curves and durations in fashion today should be revisited periodically; the underlying rule — motion only to communicate state, never to decorate — should not.

---

## 14. Visual Language Philosophy

**Timeless principles:**
- **Whitespace is a structural material, not empty leftover space.** It is what produces calm and hierarchy simultaneously, and it is the cheapest, most durable design tool available — it never goes out of style because it isn't a style, it's an absence.
- **Typography carries hierarchy before color does.** A well-chosen type scale (size, weight) should be able to communicate structure even with color removed entirely; color should then reinforce that hierarchy, not replace it.
- **A restrained, confident palette** — a small neutral range plus one accent used sparingly for the platform's own actions and signals — outlasts any particular fashionable color trend, and reads as "professional excellence" rather than "busy" precisely because of what it leaves out.

**Current inspiration, explicitly named as inspiration, not rule:** SAP Fiori's Horizon visual language and Apple's current Human Interface visual conventions are both credible, currently-well-executed expressions of the principles above — clear type scales, restrained color, generous whitespace. Neither should be treated as the destination; both should be treated as evidence the principles above are sound, replaceable the moment a better expression of the same principles exists.

---

## 15. Component Philosophy

- **A small, orthogonal set of components**, each with exactly one clear job, composed together to build every screen — not a sprawling library of near-duplicate, screen-specific variants.
- **Every new component request is first a request to compose existing components differently.** A genuinely new component is added only when no composition of existing ones can express the need — this is the same discipline [00-vision-and-principles.md](../architecture/00-vision-and-principles.md) applies to avoiding god classes, applied to the design system instead of the codebase.
- **Components are systemic, not artistic.** A component's visual identity comes entirely from the design tokens it consumes (§16) — never from one-off styling applied at the point of use.
- **State, not just appearance, is standardized.** Every interactive component defines its full state set (default, hover, focus, active, disabled, loading, error) once, centrally — screens consume that definition, they don't reinvent it.

---

## 16. Design Tokens Strategy

Design tokens are the deliberate seam between this document's principles and any implementation technology — they are what make this document "practical enough that React, Tailwind, and Figma implementations naturally derive from it" without this document naming any of those technologies as a rule.

**Three layers, each with one job:**

| Layer | Purpose | Example |
|---|---|---|
| **Primitive tokens** | Raw values, no meaning attached | `blue-600`, `space-4`, `radius-2` |
| **Semantic tokens** | Meaning, mapped to primitives | `color-action-primary`, `space-content-gap`, `radius-card` |
| **Component tokens** | One component's specific need, mapped to semantic tokens | `button-primary-background`, `card-border-radius` |

**Why this matters for a ten-year horizon:** a visual refresh (a new palette, a new type scale) should require changing primitive and semantic tokens only — every component and every screen updates automatically, because nothing above the primitive layer ever hardcodes a raw value. This is the direct design-system analogue to the architecture's "no vendor lock-in" principle: the platform should never be locked into today's specific colors and spacing any more than it should be locked into today's specific cloud vendor.

In current implementation terms (named here only as an implementation note, not as a rule this document depends on): this layering maps naturally onto CSS custom properties or a Tailwind theme configuration, and onto Figma variables — but the tokens are defined by this document's semantic layer, not by whatever tool happens to consume them.

---

## 17. Responsive Strategy

Enterprise delivery work of the kind this platform supports is overwhelmingly **desktop- and large-screen-first**, unlike consumer products — the primary personas (§4) are doing focused, structured work sessions at a workstation, not glancing at a phone. This inverts the common "mobile-first" default:

- **Design and validate the primary desktop/large-screen experience first**, since that is where the platform's real work happens.
- **Degrade gracefully to smaller viewports** rather than being designed for them first — content reflows and re-prioritizes, but the platform does not promise a full-parity mobile experience for deep, multi-step delivery work, since that isn't how the work is actually done.
- **Breakpoints are defined by content and layout needs, not by fixed device categories** — a breakpoint exists because a specific layout stops working at that width, not because it matches a named device class.

---

## 18. Enterprise UX Guidelines

- **Density appropriate to the work, never cramped.** Enterprise users often review substantial structured information (a full requirement, a full document) — the platform should present that information with real density where it genuinely helps scanning, but density must always still respect whitespace-as-hierarchy (§14); density and clutter are not the same thing, and confusing them produces "busy," one of the explicitly rejected feelings. This is the same density this document names in §2's "depth over density" from the opposite side — see XLS §5 for the formal two-mode model resolving both.
- **Error prevention over error messaging.** The best error message is the one never shown because the interface made the error impossible (e.g., disabling a submit action until its preconditions are met) — this is preferred over allowing an error and then explaining it well.
- **State is never silently lost.** Enterprise trust depends on the user never wondering "did that save?" — every state-changing action has an unambiguous, honest confirmation.
- **Destructive or irreversible actions require deliberate, proportionate confirmation** — proportionate meaning a single low-risk action needs a lighter confirmation than an action affecting an entire project or tenant.
- **Audit and traceability are visible, not just logged.** If the platform records who approved or generated something (which the architecture already requires — see [06-event-model.md](../architecture/06-event-model.md)), the *experience* should surface that provenance somewhere the user can actually find it, not only in a backend audit log nobody in the product ever sees.

---

## 19. SAP/Fiori alignment

**What this platform deliberately aligns with, conceptually:**
- **Role-based experience** — what a user sees is shaped by what they're there to do, not a single undifferentiated interface for everyone (Fiori's foundational premise, and one this platform's persona-driven IA in §4/§6 already shares).
- **The "launchpad as workspace list" metaphor** — a curated entry point into the specific pieces of work relevant to this user, conceptually similar to a Fiori Launchpad, expressed through this platform's own Workspace model (§7).
- **The object page pattern** — a single artifact (a requirement, a project, a document) as a coherent, navigable page with its own header, sections, and related actions, rather than that artifact's data scattered across disconnected screens.
- **Structured floorplans as a concept** — the idea that recurring *types* of work (review-and-approve, guided data capture, list-and-detail) deserve a consistent, named pattern, reused deliberately rather than re-invented per screen.

**What this platform explicitly does not carry forward from Fiori:**
- Its **current visual density and chrome** — this document's alignment with Fiori is conceptual/floorplan-level, not pixel-level; Fiori's specific current visual execution is cited as inspiration in §14, not copied wholesale.
- The **table-of-tables-as-default** tendency common to ERP-adjacent tools, which is precisely the "traditional ERP" feeling this platform must never produce.

---

## 20. Apple Human Interface inspirations

**What this platform deliberately borrows:**
- **Clarity, deference, and depth** — Apple's HIG framing that content should be clear, chrome should defer to content, and depth (via subtle hierarchy, not literal 3D) should communicate structure — all three map directly onto this document's own Design Principles (§10).
- **Restraint and typographic confidence** — a small, well-considered type scale and generous whitespace doing most of the hierarchy work, exactly as argued in §14.
- **Consistency as a trust mechanism** — the HIG's insistence that a platform's patterns be predictable across the whole surface, which this document independently arrives at in §10–11 from enterprise-trust reasoning, not by copying Apple's reasoning.
- **Plain, human-centered language in copy and messaging** — avoiding jargon and system-internal terminology in user-facing text, the same instinct behind this document's Information Architecture (§6) hiding backend service boundaries from the user.

**What this platform explicitly does not borrow:**
- **Consumer-app playfulness** — bounce, spring, and other delight-oriented motion patterns common in Apple's consumer products are explicitly rejected in §13; this platform's target feelings (§3) are confidence and calm, not delight-through-charm.
- **Mobile-specific gesture vocabulary** (swipe-to-reveal, edge gestures) that has no clear desktop-first analogue, given this platform's responsive strategy (§17) treats desktop as primary.

---

## 21. Future-ready AI UX principles

These principles are written to hold as AI capability grows substantially over the platform's ten-year horizon — deliberately independent of any specific model generation or interaction fashion current in 2026.

1. **Transparency scales with stakes.** The higher the consequence of an AI-driven action, the more the interface must show about *why* the system produced what it produced — this scales *up* as AI takes on higher-stakes work, it does not stay fixed.
2. **Human authority is preserved at every decision boundary**, no matter how capable the underlying model becomes. This platform's premise (§9, §2) is that AI accelerates a human-governed workflow; it is never designed to replace the decision boundary itself, only to make what arrives at that boundary better.
3. **The interface must be ready for multiple, specialized agents, not just one generalist assistant.** As the platform's own architecture already anticipates multi-agent orchestration ([15-ai-workspace.md](../architecture/15-ai-workspace.md)), the experience layer must be able to attribute a given proposal or artifact to *which* capability produced it — a single undifferentiated "the AI" voice will not scale to a multi-agent future.
4. **Provenance is a first-class, permanent property of every AI-produced artifact** — not a debugging aid, a durable feature. As artifacts flow further downstream (Sprint 2's generated documents, and beyond), losing track of what was AI-produced versus human-authored, and on what basis, becomes a governance and trust liability, not just a UX nicety.
5. **AI's presence in the interface should be able to shrink, not just grow.** A future where AI is highly capable and mostly invisible — doing correct, unremarkable work with minimal ceremony — is a *success* condition for this platform's philosophy (§2), not a failure to "show off" the AI.

---

## 22. Frontend Engineering Standards

This section is where the Platform Experience Foundation becomes binding on implementation, without naming implementation choices as if they were principles themselves.

- **Design tokens (§16) are the single source of truth for every visual value.** No component or screen may hardcode a color, spacing, radius, or duration value that has a corresponding token — this is enforced the same way the architecture's fitness functions enforce boundary rules (see [10-coding-standards-and-naming.md](../architecture/10-coding-standards-and-naming.md)), not left to code review discretion alone.
- **Components are composed from the shared component set (§15) by default.** A new one-off, screen-specific component is a deliberate, reviewed exception, not a routine outcome of building a screen.
- **Accessibility (§12) is validated as part of implementation, not audited afterward** — semantic HTML, keyboard operability, and focus management are implemented as the component is built, the same way a domain invariant is enforced in the type system rather than checked later by a linter.
- **Motion (§13) is implemented via the shared motion tokens**, and every animated transition must have a `prefers-reduced-motion` fallback verified before it ships.
- These standards apply regardless of the specific frontend stack in use; today that stack is Next.js/React with Tailwind, consistent with [03-monorepo-and-packages.md](../architecture/03-monorepo-and-packages.md) — this document does not depend on that remaining true, only on whatever stack is current honoring the token/component/accessibility discipline above.

---

## 23. UX Governance

UX governance mirrors this project's existing architecture governance model deliberately, so the two disciplines stay in lockstep rather than drifting into separate cultures.

- **Every Vertical Slice's Product Design Review** (the same review type already established — see [docs/governance/sprint-1-product-design-review/](../governance/sprint-1-product-design-review/)) must explicitly check its proposed screens against this document's principles, section by section where relevant, the same way an ADR is checked against [00-vision-and-principles.md](../architecture/00-vision-and-principles.md)'s non-negotiable list.
- **A deviation from a "must" principle in this document requires an explicit, recorded justification** at the point of decision — recorded in the same Engineering/Decision-Log discipline already used for architecture (`ENGINEERING_DECISION_LOG.md`), not left as an undocumented judgment call.
- **This document itself changes only deliberately**, not incrementally as a side effect of building one screen. A genuine change to a principle here should be proposed, reviewed, and recorded with the same weight as an ADR — a new numbered revision of this document (PXF v1.1, v2.0, …), not a silent edit. This document is versioned as PXF v1.0.1 as of the governance patch that added this sentence.
- **Ownership:** the Design System Architect function (this document's own authoring voice) is accountable for this document's currency and for arbitrating disputes between a proposed screen and a stated principle here.
- **Constitutional precedence and conflict resolution:** this document is authoritative within its declared domain — experience philosophy: vision, personas, journeys, and information architecture. Where two constitutional documents both bear on a decision, the one whose declared domain most specifically covers that decision's subject matter governs; overlap is expected and is not itself a conflict. A genuine, irreconcilable conflict between two constitutional documents is escalated jointly to the owning functions of both, resolved by amending whichever document's claim was in error, and recorded in `ENGINEERING_DECISION_LOG.md` — never resolved by silently favoring one document over the other.

---

## 24. Design Review Checklist

To be used at every Vertical Slice's Product Design Review, alongside the existing review artifacts in `docs/governance/`:

| # | Check | Reference |
|---|---|---|
| 1 | Does every screen have exactly one clear primary action? | §10, §11 |
| 2 | Is all prior-captured information already present, never re-asked? | §5 |
| 3 | Is the user's position within the overall journey visible? | §5, §8 |
| 4 | Is every AI-produced artifact presented as a reviewable proposal, with visible basis/confidence? | §9 |
| 5 | Is AI affordance present only where AI is actually contributing at that moment? | §9 |
| 6 | Does the screen use only tokens and shared components — no one-off styling? | §15, §16, §22 |
| 7 | Is every interactive element keyboard-operable with a visible focus state? | §12 |
| 8 | Does color-conveyed meaning have a non-color backup (text/icon/shape)? | §12 |
| 9 | Is any motion used purely for state communication, with a reduced-motion fallback? | §13 |
| 10 | Is any irreversible action distinguished and proportionately confirmed? | §11, §18 |
| 11 | Does the screen degrade gracefully at a smaller viewport without losing core function? | §17 |
| 12 | Would this screen still make sense to someone who has never seen a chat interface? (chat-wrapper check) | §2, §9 |
| 13 | Could this screen be mistaken for a generic admin dashboard? (dashboard-heavy check) | §2, §7 |
| 14 | Is global navigation unchanged by this addition? (menu-driven check) | §8 |

A screen that fails any "must"-tier item above (1, 2, 4, 5, 7, 8, 12) is not ready for implementation — the same bar an architecture violation would fail at a Readiness Review.

---

## 25. Definition of Done for UX

A screen or workflow is UX-complete only when **all** of the following are true:

1. Passes every checklist item in §24, or has an explicit, recorded exception per §23.
2. Uses only shared components (§15) and design tokens (§16) — no hardcoded visual values.
3. Meets WCAG 2.2 AA, verified (not assumed) — keyboard-only walkthrough completed, screen-reader content order checked.
4. Every state (default, hover, focus, active, disabled, loading, error, empty) is designed, not just the happy path.
5. Every AI-touching surface states what produced its content and how confident/reviewable it is.
6. Copy has been reviewed for plain, human-centered language — no internal system/service terminology exposed to the user.
7. Motion, if present, has a verified `prefers-reduced-motion` fallback.
8. Responsive behavior has been checked at the platform's defined breakpoints (§17), not just at one reference resolution.
9. The change has been checked against this document's emotional design goals (§3) — does it produce the target feelings, and does it avoid the rejected ones?

This Definition of Done is additive to, not a replacement for, this project's existing engineering Definition of Done (build/typecheck/test/lint/format/deps/fitness) — a screen can pass every engineering check and still fail this one, and both are required. Where a screen also touches the Engineering Canvas or is built after the Experience Language Specification's adoption, the ECS's Definition of Done (ECS §15) and the XLS's Definition of Done (XLS §40) apply additively as well — none of the four constitutional documents' Definitions of Done substitutes for another.

---

## Closing note

This document is written to hold for the platform's full ten-year horizon precisely because it is built almost entirely from *principles* (cognitive load, accessibility law, enterprise trust, information architecture) rather than from *current fashion*. Every place a current system (Fiori Horizon, Apple HIG) or a current visual trend is cited, it is cited explicitly as **inspiration, not doctrine** — replaceable the moment something expresses the underlying principle better. What must not be replaced, without the same deliberate governance this project already applies to its architecture, are the principles themselves.

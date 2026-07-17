# 01 — Experience Language Specification (XLS v1.0.1)

**Status:** Constitutional — governing at the same authority level as [00-vision-and-principles.md](../architecture/00-vision-and-principles.md) (Architecture Foundation, "AF"), [00-platform-experience-foundation.md](00-platform-experience-foundation.md) (Platform Experience Foundation, "PXF"), and [docs/product/00-engineering-canvas-specification.md](../product/00-engineering-canvas-specification.md) (Engineering Canvas Specification, "ECS"). See [PROJECT_CONTEXT.md](../../PROJECT_CONTEXT.md)'s "Constitutional documents" section for the current, authoritative enumeration of the full constitutional set — this document does not restate a count inline, since it would go stale the next time a document is added. None of the set may be contradicted by an ADR, a Product Design Review, or an implementation without the same deliberate, recorded governance process used to change any one of them (§38).
**Authored as:** Chief Design Officer / Enterprise Design Language Architect / Human Factors Specialist / Product Experience Strategist.
**Scope:** the visual, interaction, motion, and communication *language* the platform expresses itself through — every screen, every component, every AI-produced surface, in the Guided flows, the Engineering Canvas, and everywhere else, present and future.
**Explicitly not in scope:** Figma files, wireframes, React components, Tailwind configuration, CSS, HTML, or design tokens' actual implemented values. This document defines the principles a future implementation must obey (§36, §37) — it does not perform that implementation.

## Relationship to the Architecture Foundation, the PXF, and the ECS

The AF decided how the platform is *built*. The PXF decided how the platform *behaves and feels*, at the level of vision, personas, journeys, and information architecture. The ECS decided how one especially central object — the Engineering Canvas — is *structured and experienced* as a graph. **The XLS decides how all of it looks, moves, and communicates.** It is the shared visual and interaction language underneath both the PXF's general screens and the ECS's Canvas — the reason a Guided-flow form and a Canvas node inspector should feel like the same product, not two products sharing a login page.

This document does not restate the PXF's principles (Design Principles §10, Interaction Principles §11, Accessibility Principles §12, Motion Principles §13, Visual Language Philosophy §14, Component Philosophy §15, Design Tokens Strategy §16, Responsive Strategy §17) or the ECS's Canvas-specific rules (node/relationship taxonomy, the four views, AI annotation, keyboard-first operation). It **specializes and completes** them into an actual design language precise enough that a future Figma library and a future React implementation are direct, checkable consequences of reading it — not independent creative exercises that merely try to be "consistent with the vibe."

Throughout, **Timeless principle** marks a rule justified from first principles (perception, cognitive load, accessibility law, enterprise trust) that should hold for the platform's full decade. **Current inspiration** names a real system whose present-day execution expresses a timeless principle well — named explicitly so it can be replaced the moment something expresses that principle better, without ever being mistaken for the principle itself. The named inspirations for this document — SAP Fiori Horizon, Apple's Human Interface Guidelines, Apple's Liquid Glass material, Linear, and Raycast — are cited for specific, narrow reasons in the sections below; none of them is this platform's destination, and the closing note (below the final section) states explicitly why the resulting language must not be mistaken for any one of them.

---

## 1. Experience DNA

Five irreducible traits every other section in this document derives from. If a future decision can't be traced to one of these, it doesn't belong in this language.

| Trait | What it means |
|---|---|
| **Structured calm** | Order is visible before it is explained; nothing on screen competes for attention that doesn't need it |
| **Quiet intelligence** | Capability is demonstrated by correctness and restraint, not by visual assertions of "smartness" |
| **Typographic confidence** | Hierarchy and meaning are carried by type and space first — color and ornament are reinforcement, never the primary signal |
| **Material honesty** | A surface's visual treatment (§10, §11, §14) always tells the truth about its role and permanence — nothing is styled to look more or less important than it is |
| **Earned restraint** | Every visual element must justify its presence; the default is fewer, not more |

**Timeless principle:** DNA traits are the compression of every later rule into a form a designer can hold in memory while making a judgment call not explicitly covered elsewhere in this document.

---

## 2. Brand Personality

The platform's personality metaphor — **a senior delivery partner**, not an assistant, a tool, or a mascot — is defined once, canonically, in PXF §1; it is not redefined here. This section only translates that single metaphor into personality traits a design language can actually be checked against.

| Is | Is not |
|---|---|
| Composed | Excitable |
| Precise | Approximate |
| Plainspoken | Jargon-heavy or falsely casual |
| Quietly confident | Boastful or falsely humble |
| Attentive | Chatty |

**Timeless principle:** a personality expressed consistently across every surface is what makes the platform feel like *one* product engineered by people who understood their own users, rather than a collection of screens shipped by different teams with different taste.

---

## 3. Emotional Communication

The PXF names the target and rejected feelings (PXF §3); this section states the visual/interaction *mechanisms* the design language uses to actually produce them.

| Target feeling | Language mechanism |
|---|---|
| Confidence | Unambiguous hierarchy (§6); decisive, single-weight typography (§7) |
| Clarity | Restrained density (§5); one primary action visually dominant per surface |
| Calm | Generous, systematic space (§12); motion only where it communicates (§15) |
| Trust | Consistent materials and elevation logic (§11, §14) applied identically everywhere |
| Intelligence | Precise typographic and spatial rhythm; AI signaling that is exact, never decorative (§19) |
| Flow | Predictable elevation/motion grammar (§14, §15) that never surprises a returning user |
| Professional excellence | A restrained, small, deliberate visual vocabulary — the opposite of visual improvisation |

The seven rejected feelings — busy, gimmicky, toy-like, dashboard-heavy, ERP-like, menu-driven, chat-wrapper, visually noisy — are the failure mode every section below is written to make structurally difficult to produce, not just discouraged by taste.

---

## 4. Enterprise Design Language

**Timeless principle:** an enterprise design language optimizes for repeated, high-stakes, often time-pressured use by people who did not choose this software for fun — it earns trust through unglamorous consistency, not delight-seeking novelty. This rules out chasing consumer visual trends for their own sake, and equally rules out the opposite failure — the dense, dated, undifferentiated chrome of legacy ERP tooling (PXF §19) — by holding both to the same standard: does this serve the work, or decorate it?

**Current inspiration:** SAP Fiori Horizon and Linear both demonstrate that "enterprise" and "restrained, confident, modern" are not in tension — cited here because both prove the point against the dated-ERP stereotype, not because either is this platform's destination.

---

## 5. Information Density Philosophy

Two deliberate density modes, chosen by task, not by screen-type convention:

| Mode | When it applies | Character |
|---|---|---|
| **Reference density** | Scanning/comparing structured data — tables, lists, the Canvas at a zoomed-out level | Denser, typographically compact, optimized for scanning speed |
| **Focus density** | Making one decision, reading one artifact, answering one clarification | Spacious, one primary object per view, nothing competing |

**Timeless principle:** density is a tool matched to cognitive task, not a fixed aesthetic setting — treating "enterprise" as a license for permanent density, or treating "calm" as a license for permanent sparseness, are both mistakes. The correct density is whichever one the task in front of the user actually needs, and both densities still obey the same restraint (§1) and hierarchy (§6) rules — Reference density is compact, never cluttered.

---

## 6. Visual Hierarchy

A strict, ranked order of which tool establishes importance first:

1. **Typographic weight and size** — the primary hierarchy signal (§7).
2. **Spatial position and proximity** — what's grouped together, what's set apart (§12).
3. **Elevation** — what's above or behind what, structurally (§14).
4. **Color** — reinforces a hierarchy already established by the above; never establishes it alone (§8, §9).
5. **Iconography** — labels and accelerates recognition; never a primary hierarchy signal on its own (§17).

**Timeless principle:** this ranking exists because the first two tools (type, space) remain legible in every rendering condition — grayscale, print, low-vision, colorblind-safe modes — while color and decoration do not. A hierarchy that only works in color is not a real hierarchy.

---

## 7. Typography Language

- **One typeface family, used consistently everywhere** — a single, highly legible sans-serif optimized for interface and data reading, not a display or expressive face. Weight and size variation within that one family carry hierarchy (§6); a second family is not introduced for "personality."
- **A small, deliberate type scale** — few discrete sizes, each with a defined role (not a continuous slider of possible sizes) — every piece of text on the platform maps to one of these roles.
- **Generous line height for enterprise reading** — the platform's primary content is often dense, structured prose (a requirement, a generated specification) that must be comfortably readable in extended sessions, not skimmed like marketing copy.
- **Tabular figures wherever numbers are compared** (tables, metrics, timestamps) — digits must align vertically for fast scanning, a data-legibility requirement, not a stylistic one.

**Timeless principle:** typography is this platform's primary structural material (§1, §6) — every other visual tool is secondary to getting the type scale and rhythm right.
**Current inspiration:** Linear's and Raycast's restrained, single-family type systems, and Fiori Horizon's data-oriented tabular-figure discipline — all cited for the same underlying reason: a small, consistent type system reads as more trustworthy than a varied one, not because any one of them should be this platform's actual typeface.

---

## 8. Color Philosophy

- **A small neutral foundation carries almost the entire interface** — backgrounds, surfaces, borders, and the great majority of text.
- **One confident accent, used sparingly**, reserved for the platform's own primary actions and the user's current focus — not decoration, not variety.
- **Color is earned, not defaulted to.** Every additional hue introduced beyond the neutral foundation and the one accent must justify itself against §9's fixed semantic vocabulary — there is no "just for visual interest" color.

**Timeless principle:** a small, restrained palette is what produces "calm" and "professional excellence" simultaneously (§3) — the moment color is used for variety rather than meaning, the platform starts reading as busy or, worse, toy-like.
**Current inspiration:** Linear's and Fiori Horizon's near-monochrome-plus-one-accent palettes, and Apple HIG's restrained system-color discipline — cited because all three demonstrate that restraint reads as confidence, not because this platform adopts any of their specific hues.

---

## 9. Semantic Color Language

Color's only job beyond the neutral foundation and the one accent (§8) is to encode **meaning**, through a small, fixed vocabulary that never grows ad hoc:

| Semantic category | Meaning | Governing rule |
|---|---|---|
| Informational | Neutral, non-urgent system communication | Never uses the accent or a status hue |
| Success | A completed, confirmed, positive state | One consistent hue, used only for this |
| Warning | A state needing attention, not yet an error | Visually distinct from both success and danger |
| Danger | An error or destructive-action state | Reserved exclusively for genuine errors/destructive confirmation — never used decoratively |
| AI provenance | Content proposed by AI, not yet human-confirmed | A single, consistent treatment distinct from all four above (extends ECS §7 platform-wide) |

**Timeless principle:** exactly one semantic hue per category, applied identically everywhere, is what makes color trustworthy — the moment a user has seen the danger hue used for something that wasn't actually an error, every future use of that hue carries less signal. Per PXF §12, every semantic color is always paired with text, icon, or shape — never color alone.

---

## 10. Glass Philosophy

Translucent, glass-like materials are used **only to communicate transient spatial layering** — that a surface floats temporarily above the content it's currently referencing (a command palette, a brief contextual overlay) — never as a persistent surface treatment, and never for decorative appeal.

**Timeless principle:** translucency is a truth-telling device about *temporariness and depth*, not a texture. A surface that will persist (a panel the user works in for minutes, an Inspector) is not a candidate for glass treatment (§11) — persistence is communicated by solidity, not transparency.
**Current inspiration:** Apple's Liquid Glass is the most current, well-executed expression of this idea — cited explicitly as *inspiration for the concept of translucency communicating transience*, not as a visual target. This platform's glass usage must remain more restrained than a consumer product's: legibility and contrast are never compromised for the effect, a fully opaque fallback is always available for reduced-transparency and low-vision needs, and glass is never used broadly enough to become this platform's signature look — the moment it stops being an occasional, meaningful signal and becomes ambient decoration, it has been misapplied.

---

## 11. Material Philosophy

A small, closed set of surface materials, each with exactly one job:

| Material | Role | Persistence |
|---|---|---|
| **Base** | The canvas the user's primary content sits on | Persistent |
| **Raised** | A distinct, self-contained object (a card, a panel) | Persistent |
| **Overlay** | A surface that temporarily blocks or focuses attention (a modal, a confirmation) | Temporary, dismissible |
| **Translucent overlay** | A surface that floats above content it references without fully obscuring it (§10) | Transient |

**Timeless principle:** four materials, each unambiguous in role, is what lets a user infer a surface's behavior (can I dismiss it? is it part of the page or floating above it?) from its appearance alone, without needing to interact with it first — this is a direct expression of "material honesty" (§1).

---

## 12. Spatial System

- **A single, systematic spacing scale** applied everywhere — not ad hoc per-screen spacing decisions. Every gap, margin, and padding value used across the platform maps to one step in this scale.
- **Proximity communicates relationship** — a Gestalt-psychology first principle: elements placed close together are read as related; elements set apart are read as unrelated. Grouping on this platform is achieved primarily through spacing, not through borders or background fills.
- **Whitespace is never "left over"** — every gap is a deliberate structural choice (PXF §14), and the systematic scale is what keeps that deliberateness consistent across a decade of screens built by different people.

**Timeless principle:** a modular, consistently-applied spatial scale is what makes the whole platform feel engineered by one hand, regardless of how many contributors actually touch it over ten years.

---

## 13. Grid System

- **Content-driven, not device-driven.** The grid's column count and margins are determined by what the content genuinely needs to stay legible and well-aligned, not by matching a fixed device category.
- **Alignment is a trust signal.** Consistent, predictable alignment across every screen is one of the cheapest, most durable ways this language communicates precision and care — misaligned content reads as carelessness disproportionate to how small the error actually is.
- **The grid degrades gracefully** rather than reflowing arbitrarily, consistent with the PXF's desktop-first responsive stance (PXF §17) and this document's own Responsive Philosophy (§34).

**Timeless principle:** a grid is a discipline the user never consciously notices when it's followed, and immediately notices when it's broken — it is infrastructure for trust, not a visual style.

---

## 14. Elevation Model

A small set of elevation levels, each mapped to one clear meaning — never an arbitrary shadow scale chosen for visual variety:

| Level | Meaning |
|---|---|
| **Base** | The persistent working surface |
| **Raised** | A discrete, self-contained object living on the base surface |
| **Overlay** | Temporarily blocks interaction with what's beneath it |
| **Floating** | Transient, dismissible, does not block (a tooltip, a brief contextual hint) |

**Timeless principle:** elevation communicates *interaction behavior* (can I still interact with what's behind this?) before it communicates visual depth — a user should be able to predict whether dismissing what's in front of them returns focus to the base surface, purely from which elevation level they're looking at.

---

## 15. Motion Language

Four purposeful categories of motion, each with its own grammar — a small, learnable vocabulary rather than bespoke motion invented per screen:

| Category | Purpose | Character |
|---|---|---|
| **State-transition** | Communicates that something changed state (expanded, confirmed, dismissed) | Short, originates from the element that triggered it |
| **Spatial-navigation** | Communicates movement between places in the product (entering a workspace, opening an object) | Slightly longer, directionally consistent with the navigation model (PXF §8) |
| **Feedback** | Confirms an interaction was received (a button press, a save) | Very short, subtle, never the user's primary attention |
| **Ambient** | Communicates ongoing, ambient system activity (a generation job in progress) | Continuous but low-amplitude, never demanding attention |

**Timeless principle:** motion this platform uses should be recognizable as *belonging to one of exactly these four categories* — a user who has learned what one state-transition looks like should recognize every other one, everywhere in the product. Motion invented outside this grammar for a single screen is a design defect, not a flourish.

---

## 16. Animation Rules

Concrete, binding rules extending PXF's Motion Principles (PXF §13):

1. Most transitions land in the **150–300ms** range; ambient motion (§15) may run longer but must stay low-amplitude.
2. Every transition has **one clear origin and direction** — nothing fades in from nowhere.
3. **`prefers-reduced-motion` is honored everywhere**, with every animated transition having a verified, non-animated fallback that loses no information.
4. **No looping decorative animation** anywhere in the product — an ambient indicator communicates that work is ongoing, and stops the instant it isn't.
5. **No elastic, bounce, or overshoot easing** — these read as playful, which this platform's personality (§2) explicitly is not.
6. **Motion never gates comprehension** — if pausing the animation mid-way would leave the user confused about the resulting state, the animation is communicating too much and should be simplified.

---

## 17. Iconography Philosophy

- **Icons are functional labels, not decoration.** Every icon accelerates recognition of an already-named action or concept; no icon exists purely to make a screen look more finished.
- **One consistent geometric system** — a single stroke weight and construction logic applied to every icon, matching the typographic weight it sits alongside (§7), so icons and type read as one coherent system rather than two competing visual languages.
- **Icons never carry meaning alone** — per PXF §12, every meaningful icon is paired with a text label or is a well-established, unambiguous convention (e.g., a close symbol) — novel icon-only affordances are not introduced.
- **Restraint in application** — not every action or concept needs an icon; an icon is added because it measurably speeds recognition of something used often, not to fill visual space.

---

## 18. Illustration Philosophy

This platform uses illustration rarely, and never as personality decoration.

- **No mascots, characters, or anthropomorphized figures**, anywhere — the single fastest route to the "toy-like" and "gimmicky" feelings this platform must never produce.
- **Where illustration appears at all** (most plausibly in empty states, §26), it is abstract or geometric, restrained in color (drawing from the same neutral-plus-accent palette, §8), and always secondary to the text explaining what belongs there.
- **Illustration is never load-bearing for meaning** — removing it should never leave a screen unclear, only slightly less warm.

**Timeless principle:** enterprise trust is undermined, not built, by whimsy — this is a direct, permanent rejection of a common consumer-product pattern, stated explicitly so it is never quietly reversed by a well-intentioned "delight" initiative.

---

## 19. AI Visual Language

Platform-wide visual rules for AI-produced or AI-assisted content, extending the ECS's Canvas-specific AI annotation behavior (ECS §7) and the PXF's AI Interaction Model (PXF §9) to every surface, not just the Canvas:

1. **A single, consistent, restrained AI-provenance treatment** (§9's semantic AI-provenance category) is used everywhere AI-produced content appears — one visual language, not a different treatment invented per screen.
2. **No anthropomorphized AI presence** — no avatar, mascot, or persistent character represents "the AI" anywhere in the product; this follows directly from §18 and from the platform's personality (§2: quietly confident, not chatty).
3. **AI presence is visually proportional to its actual contribution** (PXF §9) — the AI-provenance treatment appears only on content AI actually produced or is actively producing, never as ambient branding on screens where it isn't contributing.
4. **Confidence, where shown, uses the same restrained language as everything else** — a precise, legible signal (consistent with "quiet intelligence," §1), never a flashy or gamified indicator.

---

## 20. Canvas Visual Language

The visual expression of the ECS's structural rules (ECS §4, §5, §8), completing what the ECS deliberately left as "implementation":

- **Each node category (ECS §4) has one consistent shape/visual identity**, applied to every node in that category regardless of its specific registered type — visual identity is a property of the category, never invented per node type.
- **Edge visual weight communicates permanence, not decoration** — Structural and Traceability relationships (the graph's backbone, per ECS §5) render more visually stable and solid; Governance and Derivation relationships, which represent more live, evolving judgment, render lighter — exactly the rendering-weight guideline the ECS calls for, now given a concrete visual basis (weight and solidity, not arbitrary color).
- **Semantic zoom (ECS §8) aggregates visually, not just numerically** — as detail aggregates into a cluster, the cluster's visual treatment communicates "this contains more," using the same elevation and material vocabulary (§11, §14) as the rest of the platform, not a bespoke Canvas-only visual system.
- **The Canvas view obeys every other section of this document** — its typography, color, spacing, and motion are the same language as the rest of the platform, applied to a graph-shaped surface; it is not a visually separate "tool" bolted onto the product.

---

## 21. Platform Shell Language

This section governs the platform's *global* chrome — deliberately not named "Workspace Shell," since its content is about navigation shared across every Workspace, not a per-Workspace surface, and "Workspace" is a formally defined container object elsewhere in this constitutional set (PXF §7, ECS §3). The persistent chrome (PXF §8's minimal, stable global navigation) is visually the quietest part of the platform — its job is to almost disappear, so the user's actual work (a Guided flow, the Canvas, a Document) visually dominates every screen.

- **Minimum visual weight for maximum functional stability** — the shell uses the neutral foundation (§8) almost exclusively, reserving the accent and semantic colors (§9) for the content it frames, never for itself.
- **The shell never grows with feature count** — visually and structurally, exactly as PXF §8 requires functionally; a shell that visually accumulates more elements over time has failed this language, regardless of how justified each individual addition seemed.

---

## 22. Inspector Language

The Inspector (ECS §10) is a **raised** material (§11), consistently positioned, holding a calm, document-like reading and editing experience — never a dense secondary dashboard competing visually with the Canvas it's attached to.

- **Consistent internal structure** — a stable header/content/actions arrangement, applied to every Inspector regardless of what node or edge type it's showing, so a user's learned navigation of one Inspector transfers immediately to any other.
- **Focus density (§5) governs the Inspector's content**, even when the Canvas around it is in Reference density — the Inspector is where a user has committed to depth on one thing, and its language should support that, not undercut it with cramming.

---

## 23. Forms Philosophy

- **Labels sit above fields, always** — never placeholder-text-as-label, which disappears exactly when it's needed most (on a partially-filled or focused field).
- **Progressive, linear disclosure** — a form reveals what's relevant next, rather than presenting every possible field at once; this is the form-specific application of PXF §11's progressive disclosure principle.
- **Inline, preventive validation** — errors are surfaced as the user provides input, framed to prevent an invalid submission rather than to scold one after the fact (PXF §18's error-prevention-over-error-messaging principle, made concrete for forms).
- **Exactly one clear primary submission action per form**, consistent with this document's Visual Hierarchy (§6) and the PXF's one-primary-action principle (PXF §10).

**Timeless principle:** a form should read as a competent partner asking exactly what it needs, in the order it needs it — never as a bureaucratic intake document.

---

## 24. Tables Philosophy

- **Tables are reserved for genuinely tabular, comparative data** — not used as a default catch-all layout for anything with more than one field, which is the specific mechanism behind the "ERP-like, table-of-tables" failure mode this platform must avoid (PXF §19).
- **Reference density (§5) governs tables** — compact, scannable, using typographic weight and alignment (not heavy borders or zebra-striping) to separate rows and columns.
- **Row hierarchy is typographic first** — the most important column or value in a row is distinguished by weight, exactly as §6 ranks typography above color and decoration for hierarchy generally.

---

## 25. Cards Philosophy

- **A card represents exactly one discrete, self-contained object** — a Project, an Artifact, a node's summary — never a generic container used because "it needs a box."
- **Restrained elevation and border**, consistent with the Material Philosophy (§11) — a card is a Raised surface, not an opportunity for a heavier visual treatment to make a screen feel more "designed."
- **A card's internal structure is consistent across every instance of the objects it represents** — the same information appears in the same position on every card of a given kind, so scanning a list of cards is fast and predictable.

**Timeless principle:** cards are named here as a philosophy specifically because they are the most commonly over-used container in enterprise software — the rule that a card must represent one real bounded object is what keeps them meaningful rather than becoming this decade's default "put a box around it" reflex, the same fate that overtook the "everything is a card" trend industry-wide.

---

## 26. Empty States

- **Never a dead end.** An empty state always explains what belongs in this space and offers the next concrete action — the direct visual-language application of PXF §5's "there is always a clear next action."
- **Restraint over decoration** — plain, direct language first; illustration, if present at all, is abstract and secondary (§18), never a mascot explaining the emptiness on the platform's behalf.

---

## 27. Loading States

- **Proportional to actual duration**, per PXF §11's perceptual thresholds — near-instant operations need no indicator; short waits get a lightweight, subtle signal; longer operations (especially AI generation work) get an honest, real progress signal, never an indeterminate spinner standing in for an operation the system actually knows the state of.
- **Skeleton structure for structural loading** — when a screen's layout is already known before its content arrives, the loading state previews that structure (using the base/raised material vocabulary, §11) rather than a generic centered spinner that discards known information about what's coming.
- **Ambient motion (§15) for ongoing background work** — low-amplitude, non-demanding, consistent with this document's rejection of attention-seeking animation (§16).

---

## 28. Error Language

- **Calm, specific, and actionable** — an error states plainly what happened and what the user can do next; it never uses alarming full-surface treatments disproportionate to the actual severity.
- **Plainspoken, never blaming** — consistent with the platform's personality (§2), an error is phrased as a shared problem to solve, not a user mistake to announce.
- **Error prevention is preferred over error language** (PXF §18) — this section exists for the residual cases prevention cannot cover, not as the primary strategy.
- **Visually distinct via the fixed semantic danger category (§9) only** — never an invented, one-off "extra alarming" treatment for a particular error the team feels strongly about.

---

## 29. Success Language

- **Quiet and proportionate** — success is confirmed unambiguously (PXF §18: state is never silently lost) but without celebration, animation flourish, or fanfare disproportionate to enterprise work.
- **The same restrained success semantic (§9) every time** — a saved form field and a completed multi-day generation job use the same visual vocabulary for "this succeeded," differing only in where and how prominently it's surfaced, never in kind.

---

## 30. Notification Language

- **Scoped and relevant, never an undifferentiated accumulating feed** — the platform-wide application of the ECS's rule against a global, ever-growing feed standing in for real structure (ECS §7).
- **A small, fixed taxonomy** (informational, success, warning, error, AI-proposal — mirroring §9's semantic categories) — no new notification "kind" is introduced without extending that registry deliberately.
- **Proportionate interruption** — a notification's visual weight and whether it blocks the user's current flow scales with genuine urgency, per PXF §11's principle that friction should be proportional to consequence, applied here to interruption rather than confirmation.
- **Always dismissible, never accumulating into visual noise** — consistent with this platform's explicit rejection of "visually noisy" as a feeling (§3).

---

## 31. Accessibility Language

This section states how every preceding section is bound by the PXF's Accessibility Principles (PXF §12) — accessibility is not a separate concern layered on afterward, it is a constraint every visual/interaction rule above must already satisfy:

- Every color pairing in §8/§9 meets WCAG 2.2 AA contrast minimums, in both light and dark themes (§32).
- Every motion rule in §15/§16 has a verified `prefers-reduced-motion` fallback that loses no information.
- Every hierarchy signal in §6 remains legible with color removed entirely — verified, not assumed, exactly as §6 already requires by design.
- Every icon (§17) is paired with text or is an unambiguous, well-established convention.
- Focus states (implied throughout §14's elevation model and the ECS's keyboard-first rules) are always visible and never suppressed for visual tidiness.

**Timeless principle:** accessibility compliance that must be checked in as an afterthought was designed wrong from the start — this language is written so that following it correctly produces an accessible result, not so that accessibility is reconciled with it after the fact.

---

## 32. Dark Mode Philosophy

- **Dark mode is a first-class, independently-tuned mode, not an inverted afterthought.** Both light and dark themes are designed to independently satisfy every principle in this document — the same semantic color language (§9), the same contrast minimums (§31), the same restraint (§8) — not derived by mechanically inverting one mode's values.
- **Dark mode is not "dimmer light mode."** Its neutral foundation, accent, and semantic hues are each deliberately tuned for dark surfaces' different contrast and glare characteristics, while remaining recognizably the same design language.

**Timeless principle:** a user should be able to identify this platform's personality (§2) and hierarchy logic (§6) equally confidently in either theme — theme is a rendering choice, not a different product.

---

## 33. Theme Strategy

- **Theming happens exclusively at the semantic token layer** (PXF §16's primitive → semantic → component layering) — a theme change substitutes semantic token values; it never requires component-level logic changes, and it never introduces a fifth, ad hoc styling path alongside the token system.
- **This is what makes multi-theme support (light/dark today; potentially tenant-level branding later) safe over a decade** — a new theme is a new mapping at the semantic layer, checkable against every rule in this document, never a parallel design effort that risks drifting from it.

---

## 34. Responsive Philosophy

Extends the PXF's desktop/large-screen-first responsive stance (PXF §17) with this document's own density model (§5):

- **The primary, desktop-scale experience is designed and validated first**, at Reference density where the task calls for it.
- **As viewport shrinks, density adapts before layout breaks** — Reference density surfaces (tables, the Canvas) simplify toward Focus density's single-primary-object logic before the platform resorts to a fundamentally different layout structure.
- **Breakpoints remain content-driven** (§13), never matched to fixed device categories.

---

## 35. Design Token Strategy

The PXF (PXF §16) already establishes the three-layer token model (primitive → semantic → component). This document's job is to state the **complete set of categories** that layer must express, so no future implementation improvises a category this language actually requires:

| Category | What it must express |
|---|---|
| Color | The neutral foundation, the one accent, and every semantic category (§9) — in both themes (§32) |
| Spacing | The full modular spatial scale (§12) |
| Typography | Every role in the type scale (§7) — size, weight, and line-height together, never independently |
| Radius | A small, consistent set tied to material roles (§11), not a free value |
| Elevation | Exactly the four levels in §14, each with its own shadow/border/blur treatment |
| Motion | Duration and easing per category in §15, not a single global default |
| Iconography | The single stroke-weight/geometry system in §17, at whatever sizes the type scale requires alongside it |

**Timeless principle:** a token system missing any of the above categories will inevitably accumulate hardcoded, one-off values in that gap — completeness here is what keeps the token layer trustworthy as the platform's sole source of visual truth (PXF §16, §22).

---

## 36. Figma Derivation Rules

Principles a future Figma implementation must satisfy — not files, not layer structures:

1. **Every Figma variable/style corresponds 1:1 to a semantic token (§35)** — no color, spacing, or type style exists in the library that isn't traceable to this document's semantic layer.
2. **No hardcoded values inside components** — a component that needs a new value is a signal that the token set (§35) is incomplete, resolved by extending the token layer, never by a local override.
3. **The component library's structure mirrors the Component Philosophy's orthogonal set** (PXF §15) — a new Figma component is added only when composing existing ones genuinely cannot express the need.
4. **Every component documents its full state set** (default, hover, focus, active, disabled, loading, error — PXF §15) — a component missing a state is incomplete, not "handled later."
5. **Design review checks fidelity to this document (§39), not aesthetic preference** — a Figma proposal that deviates from a "must"-tier rule here requires the same recorded justification any other deviation does (§38).

---

## 37. React Derivation Rules

The PXF already states the general frontend engineering standards every implementation must satisfy — token-sourcing, component composition from the shared set, accessibility implemented at build time, and motion via shared tokens with a verified reduced-motion fallback (PXF §22) — and this document does not restate them. This section adds only what is specific to deriving an implementation from *this* document's visual/interaction language:

1. **Every visual value this document introduces (§7–§30) flows from the corresponding design token category (§35)** — completing, for this language's specifics, the general token-sourcing rule already stated in PXF §22.
2. **Implementation fidelity to this document is a review criterion, independent of whether the result "looks right"** — a screen that looks acceptable but was not actually derived from this language (e.g., an ad hoc spacing value that happens to look fine) has still failed this document's Definition of Done (§40), even where it would pass PXF §22's more general standards.

---

## 38. Governance

The XLS is governed exactly as every other constitutional document is governed — see [PROJECT_CONTEXT.md](../../PROJECT_CONTEXT.md) for the current, authoritative enumeration of the full constitutional set.

1. **Every Vertical Slice's Product Design Review checks proposed work against this document**, alongside every other constitutional document that applies.
2. **A deviation from a "must"-tier rule here requires an explicit, recorded justification** in `ENGINEERING_DECISION_LOG.md`, at the point of decision.
3. **This document changes only deliberately** — a new numbered revision (XLS v1.1, v2.0, …), reviewed with the same weight as an ADR or a PXF/ECS revision, never a silent edit incidental to shipping a feature. This document is versioned as XLS v1.0.1 as of the governance patch that added this sentence.
4. **Ownership** sits with the same Design System Architect function that owns the PXF and coordinates with the ECS's ownership on anything touching the Canvas Visual Language (§20) specifically.
5. **Constitutional precedence and conflict resolution:** this document is authoritative within its declared domain — the platform's visual, interaction, motion, and communication language. Where two constitutional documents both bear on a decision, the one whose declared domain most specifically covers that decision's subject matter governs; overlap is expected and is not itself a conflict. A genuine, irreconcilable conflict between two constitutional documents is escalated jointly to the owning functions of both, resolved by amending whichever document's claim was in error, and recorded in `ENGINEERING_DECISION_LOG.md` — never resolved by silently favoring one document over the other.

---

## 39. Design Review Checklist

| # | Check | Reference |
|---|---|---|
| 1 | Does hierarchy come from type and space before color or decoration? | §6, §7, §8 |
| 2 | Is color use limited to the neutral foundation, one accent, and the fixed semantic categories? | §8, §9 |
| 3 | Is any glass/translucency used only for genuinely transient surfaces, with an opaque fallback? | §10 |
| 4 | Does every surface's material (base/raised/overlay/translucent) honestly match its actual persistence and interaction behavior? | §11, §14 |
| 5 | Is spacing drawn from the systematic scale, communicating grouping through proximity? | §12 |
| 6 | Does motion belong to one of the four defined categories, with a reduced-motion fallback? | §15, §16 |
| 7 | Are icons paired with text or unambiguous by convention, never meaning-bearing alone? | §17 |
| 8 | Is any illustration abstract, restrained, and non-load-bearing for meaning — no mascots? | §18 |
| 9 | Is AI-produced content marked with the one consistent, non-anthropomorphized provenance treatment? | §19 |
| 10 | Do tables/cards represent genuinely tabular/discrete-object data, not a default container reflex? | §24, §25 |
| 11 | Is every empty/loading/error/success/notification state calm, proportionate, and actionable? | §26–30 |
| 12 | Does every color pairing and motion rule meet the accessibility bar in both themes? | §31, §32 |
| 13 | Is every visual value in the proposed implementation traceable to a design token? | §35, §36, §37 |
| 14 | Could this be mistaken for a chat interface, a dashboard, or a legacy ERP screen? | §3, §4 |

A proposal failing any "must"-tier item above (1, 2, 4, 6, 9, 13) is not ready for implementation, the same bar the PXF and ECS apply to their own checklists.

---

## 40. Definition of Done

A screen, component, or Canvas surface is language-complete only when **all** of the following are true:

1. Passes every checklist item in §39, or has an explicit, recorded exception per §38.
2. Every visual value used is traceable to a design token (§35) — none hardcoded.
3. Hierarchy is verified to survive with color removed (§6, §31).
4. Every applicable state (default, hover, focus, active, disabled, loading, error, empty, success) is designed and uses this document's language for that state (§26–30).
5. Motion, if present, belongs to a defined category (§15) and has a verified reduced-motion fallback (§16, §31).
6. Both light and dark themes have been independently checked, not just inverted (§32).
7. AI-produced content, if present, uses the single consistent provenance treatment (§19).
8. The result has been checked against this document's rejected feelings (§3) — does it avoid busy, gimmicky, toy-like, dashboard-heavy, ERP-like, menu-driven, chat-wrapper, or visually noisy, specifically?

This Definition of Done is additive to the PXF's Definition of Done for UX (PXF §25), the ECS's Definition of Done for the Engineering Canvas (ECS §15, where applicable), and this project's engineering Definition of Done (build/typecheck/test/lint/format/deps/fitness) — all that apply are required; none substitutes for another.

---

## Closing note

Every named current inspiration in this document — Fiori Horizon, Apple's Human Interface Guidelines and Liquid Glass, Linear, Raycast — was cited for one narrow, stated reason each: a specific, well-executed expression of a timeless principle this platform independently arrives at from its own personality (§2), its own emotional targets (§3), and its own enterprise constraints (§4), not from a wish to resemble any of them. None of these systems shares this platform's exact personality, density philosophy (§5), AI visual language (§19), or Canvas (§20) — a graph-native, provenance-carrying engineering workspace has no real precedent among them. The resulting language is expected, and required, to be recognizably its own — judged, at every future review, against the principles in this document, never against how closely it resembles any product named as inspiration within it.

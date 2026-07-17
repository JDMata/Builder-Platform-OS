# 00 — Engineering Canvas Specification (ECS v1.0.1)

**Status:** Constitutional — governs the Engineering Canvas for the life of the platform, on the same footing as [docs/architecture/00-vision-and-principles.md](../architecture/00-vision-and-principles.md) (the Architecture Foundation) and [docs/ux/00-platform-experience-foundation.md](../ux/00-platform-experience-foundation.md) (the Platform Experience Foundation, "PXF"). See [PROJECT_CONTEXT.md](../../PROJECT_CONTEXT.md)'s "Constitutional documents" section for the current, authoritative enumeration of the full constitutional set — this document does not restate a count or list of siblings inline, since either would go stale the next time a document is added. No ADR, Product Design Review, or implementation may contradict any document in that set without the same deliberate, recorded governance process used to change any one of them (§13).

**A note on this document's central term:** "the Engineering Canvas" names the whole specification's subject — the graph, its four views, and everything in this document. "Canvas view" (never bare "the Canvas") names specifically the spatial, pannable/zoomable view of §6's table, one of four, standing alongside "Guided view," "Documents view," and "Executive view." Where earlier text in this document used bare "the Canvas" to mean the Canvas view specifically, this revision (v1.0.1) disambiguates it — see the governance patch recorded in `ENGINEERING_DECISION_LOG.md`.
**Authored as:** the same Chief Experience Officer / Enterprise UX Architect / Design System Architect function that authored the PXF, specialized here to one object.
**Scope:** the graph model, workspace objects, node taxonomy, relationship semantics, the four synchronized views, AI annotation behavior, interaction, keyboard, inspector, timeline, extensibility, and governance of the Engineering Canvas — the platform's living engineering workspace.
**Explicitly not in scope:** Figma files, wireframes, React components, state-management choices, rendering libraries, or any other implementation detail. Those are downstream, derived artifacts — if a future design or implementation can't be justified by a principle in this document, the design is wrong, not the principle.

## Relationship to the Project Digital Twin and to the PXF

This document does **not** define a new graph data model. [ADR-0021](../adr/0021-project-digital-twin-knowledge-graph.md) and [16-project-digital-twin.md](../architecture/16-project-digital-twin.md) already decided that: every project has a knowledge graph (`DigitalTwinNode`, `DigitalTwinEdge`, opaque registry-declared `nodeType`/`relationshipType`, `provenance: 'declared' | 'ai-inferred'`, append-only versioning, snapshotting) populated by projecting domain events, never written to directly. That decision is architecture; it is accepted, frozen, and not reopened here.

**The Engineering Canvas is the primary human experience of that graph.** Where the Digital Twin answers "what is the correct, structured, traceable state of a project," the Engineering Canvas answers "how does a human see it, move through it, question it, and act on it." This document is to the Digital Twin what a user interface is to a domain model: a faithful, principled projection — never a competing source of truth, never a second model that could drift from the first.

Equally, this document does not restate the PXF. Every general principle already established there — Workspace Philosophy (PXF §7), the AI Interaction Model (PXF §9), Navigation (PXF §8), Accessibility (PXF §12), Motion (PXF §13), Component Philosophy (PXF §15), Design Tokens (PXF §16) — applies to the Engineering Canvas exactly as written. This document specializes those principles for the one object complex enough, and central enough to the platform's ten-year ambition, to warrant its own constitutional treatment: a graph-native workspace that must feel calm, trustworthy, and keyboard-operable, never like a diagramming toy or an ERP table-of-tables.

---

## 1. What the Engineering Canvas Is (and Is Not)

The Engineering Canvas is **one project's Digital Twin, made navigable, legible, and actionable by a human** — the durable, structured record of everything that was decided, produced, and connected across a project's lifecycle, always inspectable, never something the user must reconstruct from memory or from scrollback.

It is **not**:
- A diagramming tool the user manually draws boxes and arrows in. Every node and edge on the Canvas already exists in the Digital Twin because something real happened (a requirement was captured, an artifact was generated, a decision was made) — the Canvas visualizes and lets the user act on real state, it does not let the user doodle a parallel, disconnected picture of it.
- A chat interface with a graph bolted on. AI participates in the graph the same way any other producer does — by proposing nodes, edges, and annotations with visible provenance (§7) — never as a freeform conversational surface that happens to render some shapes.
- A dashboard. A dashboard answers "what is the state of everything, in aggregate." The Canvas answers "what is the shape and history of *this* project's actual work," at whatever depth the user chooses to look — aggregation (the Executive view, §6) is one honest projection of that real structure, never a synthetic vanity layer.

**Ten-year framing.** The same test the Architecture Foundation and the PXF apply: would an engineer who joins in year five understand why the Canvas behaves the way it does, and extend it without breaking that behavior? This is why the Canvas is specified as a projection of an already-durable graph rather than as a UI feature in its own right — UI features get redesigned; a project's actual traceable history must not become unreadable because a screen changed.

---

## 2. The Graph Model

**The graph is the single source of truth for the Engineering Canvas. There is exactly one graph per project — the project's Digital Twin — and every view in §6 is a projection of it, never an independent copy.**

Timeless principles, binding on any future implementation:

1. **Nothing is rendered in any of the four views (§6) that doesn't correspond to a real node or edge in the Digital Twin.** No view — the Canvas view included — has private, view-only state for anything that represents project knowledge; layout position, zoom level, and panel arrangement are legitimate view-local state, but the existence and content of a node or edge are never view-local.
2. **A node is a thing; an edge is a fact about two things.** A node is opaque at the Canvas's core — its meaning comes from its registry-declared `nodeType` (§4) — and an edge is opaque the same way, meaning coming from its registry-declared `relationshipType` (§5). The Canvas does not hardcode behavior per specific type; it renders and interacts with nodes/edges through the same general contract regardless of type, exactly as the Digital Twin's own storage layer does.
3. **The graph is append-only and provenance-carrying.** Every node has a version history; every edge is tagged `declared` or `ai-inferred` with a confidence score when inferred; nothing is ever silently overwritten. The Engineering Canvas surfaces this in every view it appears in — it does not hide it for the sake of a cleaner-looking screen (see §11, Timeline Model).
4. **The graph never leaks across projects or tenants.** Every Canvas Session (§3) is scoped to exactly one project's Digital Twin, inheriting the same tenant-isolation guarantee already established for the underlying graph store ([08-authentication-and-rbac.md](../architecture/08-authentication-and-rbac.md)).

---

## 3. Workspace Objects

Distinct from graph *content* (nodes and edges, §2, §4, §5) are the *container* objects that scope and organize it — the same Workspace hierarchy the PXF already establishes (PXF §6, §7), specialized here. Note that "Workspace" below is the formal PXF-defined container object; where this document's title and scope line informally describe the Engineering Canvas as a "workspace," that is a loose, descriptive use of the word for the whole experience, not a claim that the Engineering Canvas *is* a Workspace object in this table's sense — the Canvas Session below is the object that actually corresponds to one instance of that experience.

| Object | What it is | Relationship to the graph |
|---|---|---|
| **Workspace** | A durable, named context for one line of work (PXF §7) | Contains one or more Projects; not itself part of the graph |
| **Project** | One idea's journey from capture to delivery | Owns exactly one Digital Twin graph |
| **Canvas Session** | The interactive session through which a human views and acts on a Project's graph, through any one of the four views (§6) at a time | Not a copy of the graph — a live window onto it; a project has one graph and may be viewed through many simultaneous Canvas Sessions (e.g., two reviewers), all reading and writing the same graph |
| **Board (saved view)** | A named, reusable arrangement of Canvas view state — which nodes are expanded, which filters/groupings are active, the last spatial layout | Purely view-local state (§2, principle 1); a Board never stores graph content, only how to look at it |
| **Snapshot** | An immutable capture of the graph's full state at a milestone | The Timeline Model (§11) is built directly on `DigitalTwinSnapshot` ([16-project-digital-twin.md](../architecture/16-project-digital-twin.md) §4) — the Engineering Canvas does not define its own snapshotting mechanism |

A Board is the one workspace object that is genuinely local to the Canvas view experience rather than inherited from the architecture — it exists because different reviewers legitimately want different habitual arrangements of the same real graph, and losing that arrangement between sessions would violate the PXF's resumability principle (PXF §5).

---

## 4. Node Taxonomy

The Digital Twin already treats `nodeType` as an opaque, registry-declared string so that new artifact types never require a redesign ([16-project-digital-twin.md](../architecture/16-project-digital-twin.md) §1, §3). The Engineering Canvas needs a smaller, stable set of **experience-facing categories** that every registered `nodeType` falls into, so the Canvas can render and interact with any current or future node type consistently without knowing about it specifically. This categorization is the Canvas's kernel (§12) — it must not grow every time a plugin registers a new node type.

| Category | What belongs here | Illustrative registered node types |
|---|---|---|
| **Intent** | The originating business idea or objective a project exists to fulfill | Idea, Business Objective |
| **Requirement** | Captured, structured need — the unit of "what must be true" | Requirement, Acceptance Criterion, Clarification |
| **Decision** | A human or governance judgment made about something else in the graph | Approval, Rejection, Architecture Decision, Change |
| **Artifact** | A produced deliverable | Document, Specification, Generated Deliverable, Diagram, Test |
| **Execution** | A unit of work that produced or is producing something | Run, Generation Job, Deployment |
| **Capability** | The AI or platform capability responsible for producing or annotating something | Capability, CapabilityProvider, Agent |
| **Annotation** | Commentary attached to another node or edge, never a standalone unit of work | AI-proposed note, human comment |

Every category has a consistent, category-level visual and interactive identity (shape, iconography, default behavior) defined once and applied to every node in that category regardless of its specific `nodeType` — a new plugin-registered `nodeType` (e.g., a new generator's artifact type) inherits its category's established behavior automatically, requiring no new Canvas-side design work. This is the direct experience-layer application of "reuse before invention" already practiced at the architecture level ([16-project-digital-twin.md](../architecture/16-project-digital-twin.md) §1.

**Annotation is deliberately its own category, not a variant of Artifact.** An annotation never stands alone as a deliverable, is never traced against for completeness checks, and is always rendered attached to the node or edge it comments on — this distinction is what keeps AI commentary (§7) from being mistaken for the graph's actual substance.

---

## 5. Relationship Semantics

Edges inherit their meaning from the Digital Twin's `relationshipType` registry ([16-project-digital-twin.md](../architecture/16-project-digital-twin.md) §3) — Traceability, Structural, Derivation, Governance, Versioning, Fulfillment. The Canvas adds no new relationship types of its own; its job is to make the meaning of every registered type legible to a human at the moment they see it.

Binding experience rules:

1. **An edge is never shown without its meaning being discoverable at a glance or one interaction away.** A line connecting two nodes with no legible label or affordance to reveal its `relationshipType` is not an acceptable rendering of an edge.
2. **Every relationship type's inverse is a first-class reading, not a mental-math exercise for the user.** Because every registered type declares its inverse explicitly at the architecture level, the Engineering Canvas must let a user read a relationship in whichever direction they approached it from, in whichever view they're using ("what does this implement" and "what implements this" are the same edge, and both readings must be equally natural) — never force the user to remember which direction a label "usually" means.
3. **Provenance is always visible on the edge itself, not just on inspection.** `declared` and `ai-inferred` are visually distinguished at the graph level (§7), not only inside the Inspector Panel (§10) — a user scanning the whole Canvas must be able to tell, without clicking anything, which relationships are established fact and which are AI suggestion.
4. **Structural and Traceability edges are the graph's backbone and should read as more visually stable/permanent than Governance or Derivation edges**, which more often represent live, evolving judgment. This is a rendering-weight guideline, not a new taxonomy — it exists to keep the Canvas view legible as it grows dense, consistent with the PXF's "hierarchy over decoration" principle (PXF §10).

---

## 6. The Four Views and the Synchronization Principle

**There is one graph and four ways of looking at it.** No view owns data the others don't share; no view can drift out of sync with another, because none of them hold a copy — they render the same graph, differently.

| View | What it projects | Who reaches for it, and why |
|---|---|---|
| **Guided** | A bounded, sequential path through the parts of the graph relevant to the step at hand — the same linear, wizard-like experience Sprint 1's Discovery Workspace already demonstrates (Idea Submission → Clarification → Charter → Ready) | A user advancing a specific piece of work who needs exactly the next decision put in front of them, not the whole graph |
| **Canvas** | The full spatial graph — nodes and edges laid out for free exploration, panning, zooming, and direct manipulation | A user who needs to understand structure, relationships, and impact — "what does this actually connect to" |
| **Documents** | A linear, reading-order rendering of a coherent subset of the graph — the same content the Canvas holds, presented the way a person reads a specification rather than the way a graph is drawn | A user who needs to read, share, or export a coherent narrative account of the work, not navigate its structure |
| **Executive** | A small number of honest, aggregated signals derived directly from the real graph's real state — never synthetic metrics invented for the view | A stakeholder (PXF §4, the Executive Stakeholder persona) who needs trustworthy status, not structure |

**The synchronization principle, stated precisely:** an edit made in any view is an edit to the one underlying graph, and is instantly reflected — not "eventually," not "on refresh" — in every other view that would show it. Answering a Clarification in Guided view updates that node's state on the Canvas view and in the Documents view immediately; approving a node's promotion in the Canvas view updates the Guided view's next-step logic immediately. If two views can ever disagree about a node's current state, that is a defect in the implementation of this principle, not an acceptable inconsistency between "different tools for different audiences."

This is the direct experience-layer resolution of a tension the PXF names but does not fully resolve on its own: a workspace needs to be usable both as a guided, bounded task flow (PXF §5, §7) and as an explorable structure (PXF §6) — the Engineering Canvas resolves this by making both simply different lenses on identical, always-current truth, rather than by building two separate products that happen to share a backend.

---

## 7. AI Annotation Behavior

This section is the Canvas's specialization of the PXF's AI Interaction Model (PXF §9) for a graph-native surface, and it is built directly on the Digital Twin's own provenance mechanism ([16-project-digital-twin.md](../architecture/16-project-digital-twin.md) §1, §8) rather than inventing a parallel one.

1. **AI proposes nodes, edges, and annotations — it never commits them.** Exactly as the architecture already requires (`provenance: 'ai-inferred'`, confirmed only via a `ReviewGate` — [ADR-0020](../adr/0020-ai-workspace-for-agent-definitions.md)), the Canvas must never render an AI-produced graph element as though it were already-accepted fact. An `ai-inferred` edge or a newly-proposed node is visually distinct — by category-consistent styling, not by a badge easily missed — from `declared` graph content, everywhere it appears across all four views.
2. **Annotations are scoped, not global.** An AI annotation attaches to the specific node or edge it comments on and is dismissed or resolved at that scope — never accumulated as an undifferentiated, ever-growing global feed the user must scroll through to find what's still relevant. This is the direct Canvas-specific application of PXF §9's rule against a persistent, undifferentiated chat surface.
3. **Confidence is shown at the point of decision, not buried.** Where the Digital Twin carries a confidence score on an inferred edge, the Canvas surfaces it wherever a human is being asked to confirm or reject that edge — never only inside a detail panel the user must think to open.
4. **Attribution is always to a specific capability, never to "the AI."** Consistent with the PXF's future-ready AI UX principle that the interface must be ready for multiple, specialized agents (PXF §21), every AI-proposed graph element identifies which `Capability`/`CapabilityProvider` node produced it — the same node category already defined in §4.
5. **Rejecting an AI proposal is as easy and consequence-free as accepting it.** A rejected proposal is retired (per the Digital Twin's own "never hard-deleted, marked retired" rule — [16-project-digital-twin.md](../architecture/16-project-digital-twin.md) §4) rather than requiring the user to undo a change that was never actually committed.

---

## 8. Interaction Rules

1. **Direct manipulation on the Canvas view, constrained progression in Guided view.** In the Canvas view, a user moves, connects, expands, and groups nodes directly (subject to §2's rule that this never fabricates ungrounded graph content — spatial layout is view-local, connecting two nodes with a new edge is a real graph write). In the Guided view, interaction is deliberately bounded to the current step, exactly as Sprint 1's existing flow already behaves — this asymmetry is intentional, not an inconsistency to resolve.
2. **Selection and focus are distinct.** Selecting a node (to act on it, e.g., delete, tag, connect) is a different state from focusing it (to inspect it, §10) — a single click should not simultaneously commit to both, since they answer different questions ("what do I want to act on" vs. "what do I want to understand").
3. **Every state-changing interaction is undoable**, consistent with the PXF's reversibility principle (PXF §11) — connecting an edge, moving a node's Board-local position, retiring a node, and confirming an AI proposal are all reversible actions with a visible, immediate undo path.
4. **Zoom is semantic, not merely optical.** As a user zooms out on the Canvas view, detail aggregates into its owning category or cluster rather than simply shrinking illegibly — the same principle a well-made map applies, and the direct mechanism that keeps a large, mature project's graph legible instead of becoming visual noise (avoiding the "busy" feeling the PXF names as a failure mode, PXF §3).
5. **No interaction requires the user to know the underlying graph's technical vocabulary.** "Node," "edge," and `nodeType`/`relationshipType` are this document's and the architecture's working vocabulary — the Canvas's actual interface speaks in the user's own domain terms (a Requirement, a Decision, an Artifact), exactly as the PXF's Information Architecture principle already requires (PXF §6).

---

## 9. Keyboard-First Principles

Graph-native, spatial tools are conventionally mouse- or touch-first; the Engineering Canvas deliberately rejects that convention, treating keyboard operability as a parity requirement from the outset, not a retrofit — the same non-negotiable floor the PXF sets for accessibility generally (PXF §12), made concrete here for the one surface where it is hardest to get right.

1. **Every node and edge reachable by pointer is reachable by keyboard.** Structured traversal (moving focus between connected nodes, entering and leaving a cluster) is a first-class keyboard operation, not a fallback for when a pointer is unavailable.
2. **A command palette is the keyboard-first answer to "how do I do X"** across all four views — a single, consistent, searchable entry point to every action, so keyboard users are never required to memorize a large bespoke shortcut set to operate at parity with a mouse user.
3. **Focus state is always visible and never ambiguous** between "this node is selected" and "this node has keyboard focus" (§8, principle 2) — a keyboard user must always be able to answer both "where is my focus" and "what is selected" without switching to the mouse to check.
4. **No Canvas-view-native interaction has a keyboard-inaccessible equivalent invented instead.** Where a mouse gesture (drag-to-connect, drag-to-pan) has no natural keyboard analogue, the Canvas view provides a genuinely equivalent keyboard path to the same graph action (e.g., "connect selected node to focused node" as a command), not a degraded substitute.

---

## 10. Inspector Panels

The Canvas view shows **structure** — what exists and how it relates. The Inspector Panel shows **depth** — the full content, history, and detail of one focused node or edge. This division of labor is deliberate and load-bearing: it is what keeps the Engineering Canvas legible and calm (PXF §3) even as individual nodes carry substantial content.

1. **The Inspector is where content is actually read and edited.** The Canvas view's surface itself never attempts to render a node's full content inline — doing so would recreate the "busy," undifferentiated density the PXF explicitly rejects (PXF §3, §18).
2. **Exactly one Inspector context at a time**, tied to the current focus (§8, principle 2) — never multiple competing detail panels open simultaneously representing different foci, which would fragment attention rather than support it.
3. **The Inspector shows the same real graph content the Canvas view summarizes, never a separate, richer copy.** Consistent with §2's single-source-of-truth principle, opening the Inspector does not "load more detail from somewhere else" in a way that could disagree with what the Canvas view already implied.
4. **Provenance and history are always one Inspector view away**, never requiring a separate tool or export to answer "who or what produced this, and when" for any node or edge currently in view.

---

## 11. Timeline Model

Time is a first-class axis of the Engineering Canvas, not an audit-log afterthought — this is the direct experience-layer realization of the Digital Twin's own append-only versioning and snapshotting design ([16-project-digital-twin.md](../architecture/16-project-digital-twin.md) §4).

1. **Every node's and edge's current state is a projection over its full version history**, not an in-place-edited fact — the Canvas can always show "what this looked like before," because the underlying model never discards that history.
2. **A Timeline scrubber lets a user move the entire graph's rendered state to any prior milestone**, built directly on `DigitalTwinSnapshot` — this is a real, replayable past state of the actual graph, not a reconstructed approximation.
3. **Retirement, not deletion, is how the past disappears from the present without disappearing from history.** A retired node or edge (§2, principle 3) stops appearing in the current-state view but remains fully visible when the Timeline is moved to a point before its retirement — consistent with the "never hard-deleted" rule already established at the architecture level.
4. **The Timeline is a lens, not a separate mode with separate interaction rules.** Moving the Timeline changes what state the four views (§6) render; it does not change which view a user is in, or suspend the interaction rules (§8) or keyboard operability (§9) those views already guarantee.

---

## 12. Extensibility

The Engineering Canvas must absorb new node types, new relationship types, and new plugin-contributed behavior over a ten-year horizon without a redesign — the same discipline the Platform Kernel/Platform Pack model already establishes for the architecture ([19-platform-kernel-and-platform-packs.md](../architecture/19-platform-kernel-and-platform-packs.md), [ADR-0023](../adr/0023-platform-kernel-and-platform-pack-architecture.md)), applied here to the experience layer.

1. **The Canvas kernel is the set of category-level behaviors defined in this document** (§4's node categories, §5's relationship-category rendering weight, the four views and their synchronization, interaction/keyboard/inspector/timeline rules) — stable, and not expected to grow per feature.
2. **A new `nodeType` or `relationshipType`, registered at the architecture level exactly as [16-project-digital-twin.md](../architecture/16-project-digital-twin.md) §3 already requires, inherits its category's existing Canvas behavior automatically.** A plugin author registering a new generated-artifact type never needs to design new Canvas interaction — this is the direct proof, at the experience layer, of the same claim doc 16 makes at the architecture layer: the opaque, registry-declared type pattern absorbs new concepts without a redesign.
3. **A genuinely new node or relationship *category* (not just a new type within an existing category) is a constitutional change**, requiring the same deliberate governance as any other amendment to this document (§13) — this is deliberately a high bar, since every category carries its own established rendering and interaction identity that the whole Canvas depends on staying small and stable.
4. **View-specific extensions (e.g., a plugin contributing a specialized Document-view template for its own artifact type) are permitted as Pack-level additions**, provided they consume the same underlying graph and respect the synchronization principle (§6) — they may specialize *presentation* within a view, never fork the data a view is showing.

---

## 13. Governance

The Engineering Canvas Specification is governed exactly as every other constitutional document is governed — see [PROJECT_CONTEXT.md](../../PROJECT_CONTEXT.md) for the current, authoritative enumeration of the full constitutional set this document is part of.

1. **Every Vertical Slice that touches the Engineering Canvas is checked against this document at Product Design Review**, the same way it is already checked against every other constitutional document.
2. **A deviation from a "must"-tier rule in this document requires an explicit, recorded justification** in `ENGINEERING_DECISION_LOG.md`, at the point of decision — not an undocumented judgment call, exactly the standard already established for architecture and UX deviations.
3. **This document changes only deliberately**, via a new numbered revision (ECS v1.1, v2.0, …), reviewed with the same weight as an ADR or a PXF revision — never as a silent edit incidental to shipping one feature. This document is versioned as ECS v1.0.1 as of the governance patch that added this sentence.
4. **Ownership** sits with the same Design System Architect function that owns the PXF, in coordination with the Distinguished Enterprise Architect / Principal Systems Engineer function that owns [ADR-0021](../adr/0021-project-digital-twin-knowledge-graph.md) and the Architecture Foundation (see that document's own Governance section) — a proposed Canvas-side change that would require a new node/relationship category, or a change to the graph model itself, must be reviewed on both sides before acceptance, since it touches both constitutional documents.
5. **Constitutional precedence and conflict resolution:** this document is authoritative within its declared domain — the Engineering Canvas's work model: the graph model, node/relationship taxonomy, views, and interaction rules. Where two constitutional documents both bear on a decision, the one whose declared domain most specifically covers that decision's subject matter governs; overlap is expected and is not itself a conflict. A genuine, irreconcilable conflict between two constitutional documents is escalated jointly to the owning functions of both, resolved by amending whichever document's claim was in error, and recorded in `ENGINEERING_DECISION_LOG.md` — never resolved by silently favoring one document over the other.

---

## 14. Design Review Checklist

| # | Check | Reference |
|---|---|---|
| 1 | Does every node and edge shown correspond to real Digital Twin content — nothing view-only invented as if it were graph truth? | §2 |
| 2 | Is every `ai-inferred` element visually distinguishable from `declared` content, in every view it appears in? | §7 |
| 3 | Would an edit made in one view be instantly correct in all three others? | §6 |
| 4 | Is every relationship's meaning and inverse legible without the user doing mental math? | §5 |
| 5 | Is every action reachable by keyboard, with unambiguous, visible focus state? | §9 |
| 6 | Does the Canvas view stay legible (not "busy") as the graph grows — is zoom semantic, not just optical shrinking? | §8 |
| 7 | Is detail content deferred to the Inspector rather than crammed onto the Canvas view's surface itself? | §10 |
| 8 | Can the user always ask "what did this look like before," and get a real, replayable past state? | §11 |
| 9 | Does a new node/relationship type introduced by this change inherit existing category behavior, rather than requiring bespoke Canvas work? | §4, §12 |
| 10 | Could this addition be mistaken for a chat interface, a dashboard, or a diagramming tool? | §1 |

A change that fails any "must"-tier item above (1, 2, 3, 5, 9) is not ready for implementation, the same bar the PXF's own Design Review Checklist applies.

---

## 15. Definition of Done for the Engineering Canvas

A Canvas feature or view is complete only when **all** of the following are true:

1. Passes every checklist item in §14, or has an explicit, recorded exception per §13.
2. Renders exclusively from real Digital Twin graph state (§2) — no view-invented data standing in for graph content.
3. Every one of the four views (§6) that would plausibly show this feature renders it correctly and stays synchronized with the others.
4. AI-produced elements carry visible provenance and confidence, and can be rejected as easily as accepted (§7).
5. Full keyboard parity is verified, not assumed (§9) — a keyboard-only walkthrough completed.
6. The Inspector/Canvas division of labor is respected — no content crammed onto the spatial surface that belongs in the Inspector (§10).
7. History/Timeline behavior is verified for any new node or edge type — retirement, not deletion, and a real replayable past state (§11).
8. A new node or relationship type, if introduced, is shown to inherit its category's existing behavior without bespoke Canvas code (§12).
9. Checked against the PXF's emotional design goals (PXF §3) and this document's own definition of what the Canvas is not (§1) — does it still read as calm, trustworthy, and structured, not busy, gimmicky, or chat-wrapper-like?

This Definition of Done is additive to the PXF's Definition of Done for UX (PXF §25), the Experience Language Specification's Definition of Done (XLS §40, for anything touching the Canvas Visual Language), and this project's engineering Definition of Done (build/typecheck/test/lint/format/deps/fitness) — all that apply are required, and none substitutes for another.

---

## Closing note

The Engineering Canvas Specification exists because the platform's most ambitious ten-year claim — that a project's entire structured history is durable, traceable, and trustworthy — is only real to a human if the experience built on top of it is equally durable, legible, and trustworthy. The Digital Twin ([ADR-0021](../adr/0021-project-digital-twin-knowledge-graph.md)) already guarantees the former. This document is what guarantees the latter: one graph, four honest views of it, AI that proposes and never silently commits, and a surface that stays calm and keyboard-operable no matter how large the project's history grows.

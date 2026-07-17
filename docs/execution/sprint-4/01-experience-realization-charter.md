# Experience Realization Charter — Sprint 4

**Board:** Builder Platform OS Product Experience Board.
**Status:** Execution charter — not constitutional, not a PAS/CAP/PER/TOM/CMM revision. This document assembles already-established rules (PXF, ECS, XLS, CMM) into a Sprint 4 plan; it introduces no new principle.
**Where Sprint 4 sits:** between Sprint 3 (Executable Architecture, closed by [Gate C](../../governance/gate-c-executable-architecture-validation.md)) and Sprint 5 (Documentation Factory, the first sprint of the [Engineering Execution Strategy](../../governance/engineering-execution-strategy.md)'s own mapping). That mapping never named a Sprint 4 — this Charter fills exactly that gap: architecture is frozen and validated, engineering strategy is set, and before Sprint 5's backend capability work begins, the product's actual experience — screens, components, tokens — must be realized against the constitutional set for the first time since PXF/ECS/XLS were written.

---

## Vision for Sprint 4

Sprint 1 built five real screens (Login, Idea Submission, Clarification, Project Charter, Project Ready) **before** PXF, ECS, and XLS existed. Sprint 4's vision is narrow and concrete: **make Builder Platform OS's actual, shipped experience the first real proof that "if a mockup can't be justified by a principle, the mockup is wrong, not the principle" holds** (PXF's own opening line, restated identically in ECS and XLS) — by reconciling what was already built against the constitutional set that now governs it, and by establishing the first real design-token and component foundation that Sprint 5's Documentation Factory screens will build on.

This is the bridge Sprint 4 exists to build: **Architecture (frozen) → Experience (realized) → Engineering (Sprint 5 onward)**. Nothing here is new design philosophy — PXF, ECS, and XLS already are the design philosophy. Sprint 4 is where that philosophy meets pixels for the first time under its own governance.

---

## Principles

No new principle is introduced. Sprint 4 operates under exactly these, cited rather than restated:

- **Derivation, not invention.** Every screen, token, and component must trace to a PXF/XLS/ECS section; if it can't, the Board raises it, per PXF §16/XLS §35's own "practical enough that Figma/React derive naturally" claim, now under actual test.
- **Timeless vs. current inspiration stays explicit.** Any Figma/React decision citing Fiori Horizon, Apple HIG, Linear, or Raycast must say so, per XLS's own discipline (XLS, throughout) — never presented as if it were the principle itself.
- **AI proposes, the human disposes**, visibly, on every AI-touching screen (PXF §9.1, ECS §7, XLS §19) — re-verified on Discovery's existing Clarification/Project Charter screens, not assumed still true since Sprint 1.
- **Accessibility is a floor, not a feature** (PXF §12) — checked, not assumed, on every screen this sprint touches.
- **Restraint is the default** (XLS §1, §8) — Sprint 4 adds components only when composing existing ones cannot express the need (PXF §15, XLS's Component Philosophy inherited from it).

---

## Scope

1. **Design token foundation.** A real token set (color, spacing, typography, radius, elevation, motion, iconography — the seven categories XLS §35 requires) implemented in Figma, per XLS §36's Figma Derivation Rules.
2. **Shared component set (first tranche).** The orthogonal component set PXF §15 requires, built only as far as Discovery's existing five screens and Sprint 5's known upcoming needs (a Documentation review/approval pattern) actually require — not speculatively ahead of demand.
3. **Reconciliation of Discovery's five existing screens** (Login, Idea Submission, Clarification, Project Charter, Project Ready) against PXF §24, ECS §14, and XLS §39's Design Review Checklists — each screen re-certified or flagged with an explicit, recorded deviation.
4. **Engineering Canvas shell scaffold** — the Platform Shell (XLS §21) and Inspector (ECS §10, XLS §22) structural chrome only, with no Canvas-view content, since that depends on Graph Runtime (Sprint 6, per the Engineering Execution Strategy) and is explicitly deferred, not attempted here.
5. **A Figma prototype** validating the reconciled Discovery flow end to end (see Prototype Expectations, below).

---

## Out of Scope

- Any Canvas-view functionality that requires real graph data (depends on Sprint 6's Graph Runtime — Implementation Confidence: Medium, per the [Gate C Closure Report](../../governance/gate-c-closure-report.md) §8).
- Any Development-phase or Testing-phase screen (depends on Platform Packs, Sprint 7–8).
- Any Delivery/Repository-Provider UI (depends on Sprint 7's `RepositoryPublisherPort`, which does not exist yet).
- Production React implementation beyond what Sprint 1 already shipped for Discovery — Sprint 4 is a design/Figma/prototype sprint; wiring new components into real, deployed React code is Sprint 5+ engineering work, coordinated through the collaboration model below.
- Any new architectural concept, node category, capability, or persona. If Sprint 4's work seems to require one, that is the signal to stop and route it through the Architecture Review Process (`PROJECT_PLAYBOOK.md`), exactly as every prior review in this arc has already established.

---

## Success Criteria

- Every token category XLS §35 names exists in Figma, each one traceable 1:1 to its constitutional citation.
- All five Discovery screens pass PXF §24's and XLS §39's Design Review Checklists with zero unresolved "must"-tier failures, or carry an explicit, recorded deviation in `ENGINEERING_DECISION_LOG.md` (PXF §23, XLS §38's own deviation-recording rule).
- The Platform Shell and Inspector scaffold pass ECS §14's checklist for the structural elements they actually contain.
- A Figma prototype exists that a reviewer can click through end to end, matching the real, shipped Discovery flow's actual behavior.

---

## Deliverables

1. **The Figma token library** (per XLS §36).
2. **The Figma component library**, first tranche (per PXF §15/XLS's Component Philosophy).
3. **A Component Inventory** — a lightweight catalog (following the same discipline as CAP/PER/TOM, not a new mechanism) listing every component, its constitutional citation, and its state coverage (default/hover/focus/active/disabled/loading/error, per PXF §15) — populated as components are actually built, not pre-filled here, since this Charter does not produce UI designs.
4. **The reconciliation record** for Discovery's five screens — pass/fail per checklist item, with deviations logged.
5. **The clickable Figma prototype.**
6. **A short handoff note to the UX Team** (Engineering Execution Strategy §1) stating exactly which components are ready for Sprint 5's Documentation Factory screens to consume.

---

## Review Cadence

Reuses the exact review type this project already ran once: a **Product Design Review**, matching [docs/governance/sprint-1-product-design-review/](../../governance/sprint-1-product-design-review/README.md)'s own structure and rigor — not a new review type invented for this sprint. Cadence:

- A checkpoint review at the token-library milestone (early Sprint 4).
- A checkpoint review at the component-library-first-tranche milestone.
- A closing **Sprint 4 Product Design Review**, formally mirroring Sprint 1's, checked against PXF/ECS/XLS's Design Review Checklists in full, producing the same kind of exit-gate artifact Sprint 1's did.

---

## Design Governance

Unchanged from PXF §23, ECS §13, XLS §38 — restated only to name the specific application, not to redefine the mechanism:

- The Design System Architect function owns fidelity to PXF/ECS/XLS throughout Sprint 4.
- Any deviation from a "must"-tier rule is recorded in `ENGINEERING_DECISION_LOG.md` at the point it's decided, not after the fact.
- Sprint 4 produces no new numbered revision of PXF, ECS, or XLS — if something built this sprint reveals a genuine gap in one of them, that is routed through each document's own amendment process (a new numbered revision, ADR-weight review), never patched silently mid-sprint.

---

## Engineering Collaboration Model

Sprint 4's output is consumed by the **UX Team**, already named and scoped in the [Engineering Execution Strategy](../../governance/engineering-execution-strategy.md) §1 (owns `apps/web`, the PXF/XLS implementation). The handoff contract is exactly PXF §22's Frontend Engineering Standards and XLS §37's React Derivation Rules — already written, not renegotiated here:

- Every component the UX Team implements consumes a token, never a hardcoded value (PXF §22, XLS §37).
- Every component is composed from the shared set by default (PXF §15).
- Accessibility is implemented as the component is built, not audited afterward (PXF §22).
- Implementation fidelity to PXF/XLS is a review criterion independent of whether the result "looks right" (XLS §37) — the same standard `CODEOWNERS`' `apps/web` review already implies, made explicit for this handoff.

---

## UX Quality Standards

Unchanged from PXF §10 (Design Principles), §11 (Interaction Principles), §24 (Design Review Checklist), §25 (Definition of Done for UX) — every Sprint 4 deliverable is held to these, cited rather than restated.

---

## Accessibility Standards

Unchanged from PXF §12: WCAG 2.2 AA is the non-negotiable minimum, full keyboard operability, color never the sole carrier of meaning, content order matches visual order, `prefers-reduced-motion` respected, semantic structure over visual-only structure. Sprint 4's reconciliation of Discovery's five screens is the first point since Sprint 1 these are re-verified, not assumed.

---

## AI Experience Principles

Unchanged from PXF §9 (AI Interaction Model), §21 (Future-ready AI UX principles), ECS §7 (AI Annotation Behavior), XLS §19 (AI Visual Language). Sprint 4's reconciliation of the Clarification and Project Charter screens specifically re-verifies: AI proposes, never confirms itself; AI presence is proportional to actual contribution; provenance is shown, not asserted; no anthropomorphized AI presence anywhere.

---

## Prototype Expectations

- **High-fidelity, token-driven** — the Figma prototype uses the real token library (Deliverable 1), never placeholder styling.
- **Behaviorally accurate** — the prototype matches what Discovery's real, shipped screens actually do today, not an idealized or aspirational version of them; any intentional change is a recorded deviation (per Design Governance), not a silent improvement.
- **Not a substitute for the real screens** — the prototype validates the reconciled design language; it does not replace re-verifying the actual production React implementation against PXF §25/ECS §15/XLS §40's Definitions of Done.

---

## API Contract Expectations

Sprint 4 is a design sprint; it does not design APIs, per this Charter's own instruction and the discipline the Canonical Machine Model already established. What Sprint 4's prototype and component work must assume:

- Any data a screen displays is shaped like a [CMM](../../product/06-canonical-machine-model.md) entity (`Requirement`, `Artifact`, `Decision`, …) — never an ad hoc shape invented for the mockup.
- Where a real API doesn't exist yet (every capability except Discovery's), Sprint 4 uses **mocked data conforming to CMM's entity model**, not a live, unstable endpoint — consistent with CMM's own recommendation that JSON Schema is the canonical schema-definition layer (CMM §7).
- No prototype or component implies an API contract that hasn't been contract-tested — the same discipline `PROJECT_PLAYBOOK.md`'s Testing Strategy already requires for every port-adapter pair, applied here to the design layer's assumptions about data shape.

---

## Definition of Done

Additive to, not a replacement for, PXF §25 (Definition of Done for UX), ECS §15 (Definition of Done for the Engineering Canvas, for the shell/Inspector scaffold), XLS §40 (Definition of Done), and this project's engineering Definition of Done (`DEFINITION_OF_DONE.md`) — all that apply are required; none substitutes for another. Sprint 4 is additionally done only when:

1. Every item in Success Criteria (above) is true.
2. The closing Sprint 4 Product Design Review has run and reached a formal decision (mirroring Sprint 1's own exit-gate pattern).
3. The handoff note to the UX Team (Deliverable 6) is written and the Component Inventory (Deliverable 3) is populated for everything actually built this sprint.
4. `PROJECT_CONTEXT.md` is updated to reflect Sprint 4's closure and Sprint 5's readiness to begin, per the existing sprint-close discipline (`PROJECT_PLAYBOOK.md`, "How to end a sprint").

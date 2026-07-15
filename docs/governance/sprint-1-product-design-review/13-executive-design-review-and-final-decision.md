# Executive Design Review and Final Decision

## Strengths

- The four-screen Sprint 1 flow (idea → clarify → charter/approve → ready) is a genuinely complete, honest vertical slice — no faked artifacts, no partial plumbing exposed to the user ([01](01-user-journey-and-screen-evaluations.md)).
- "Create Project" as an *outcome* of Discovery, not an upfront form, is a deliberately better product decision than the prompt's own example journey literally shows — validated, not corrected ([01](01-user-journey-and-screen-evaluations.md)).
- The Capability Model is fully respected — zero screens, zero API routes reference an agent, provider, MCP server, or LLM directly ([10-capability-model-review.md](10-capability-model-review.md)).
- The Kernel/SAP Platform Pack boundary holds cleanly at the screen level — zero SAP-specific leakage found, no correction needed ([11-platform-strategy-validation.md](11-platform-strategy-validation.md)).
- Every future artifact type (Timeline, Cost, Risk, Functional Spec) is correctly, honestly absent rather than faked — the platform's "generated, not decorative" discipline holds under UX pressure too ([05](05-generated-artifacts-review.md)).

## Weaknesses

- As currently scoped, the Discovery experience risks reading as "a form with an AI assist" rather than "a consulting workshop" — the gap between functionally correct and experientially distinctive ([03](03-discovery-workshop-review.md), [12](12-enterprise-product-assessment.md)).
- Three concrete accessibility gaps identified (placeholder-as-label, unlabelled clarification list, unstructured review content) — cheap to fix now, expensive to retrofit after launch ([01](01-user-journey-and-screen-evaluations.md), [07](07-overall-ux-evaluation.md)).
- A real internal inconsistency existed in the backlog itself (SAF-41 scoped to a nonexistent Project) — found and corrected during this review, evidence that a Product Design Review genuinely catches things an Architecture Review alone would not.
- No login screen currently exists as a story — a real reachability gap between "Sprint 0's OIDC backend works" and "a user can actually reach Sprint 1's UI."

## Opportunities

- The "Project Charter" framing and "what happens next" panel are near-zero-cost changes with outsized narrative impact on how the product reads to a customer ([12](12-enterprise-product-assessment.md)).
- The review screen's list-of-sections layout already accommodates Sprint 2+'s Functional Spec/Timeline/Cost/Risk sections without a redesign — a scalability win earned by not over-designing Sprint 1's own screen ([01](01-user-journey-and-screen-evaluations.md)).
- The derived "confidence badge" (no new schema) shows how much of the target journey's aspirational features (Requirement Confidence) can be approximated cheaply from data the platform already has.

## UX Risks

- If the Discovery Workshop recommendations aren't applied, the platform's first customer-facing impression may under-sell its actual sophistication — a perception risk, not a functional one, but a real one given the objective explicitly asks for "enterprise engineering platform," not "correct software."
- A demo that shows a bare spinner during structuring (no progress staging) reads as slower and less "alive" than one that narrates its own work, even at identical wall-clock latency.

## Future Risks

- As Sprint 2+ adds a Project Workspace and more screens, the "no persistent navigation chrome" decision that's correct for Sprint 1 will need a deliberate, planned introduction of real navigation — not an ad hoc bolt-on once there are three, four, five destinations ([02-information-architecture.md](02-information-architecture.md)).
- If a future sprint's Assumptions/Constraints/Dependencies gap ([05](05-generated-artifacts-review.md)) is filled with three new aggregates instead of extending `RequirementKind`, it risks the same kind of unnecessary-abstraction sprawl this platform has otherwise avoided.

## Quick Wins (apply before/during Sprint 1 implementation, no scope change)

1. Fix SAF-41's wording (Workspace, not Project) — done as part of this review.
2. Add a minimal login screen, folded into SAF-42.
3. Quote source idea text next to each Clarification.
4. Show staged progress messages during structuring, not a bare spinner.
5. Surface at least one AI-suggested (never silently added) acceptance criterion.
6. Frame the review screen as "Project Charter," not "Review requirements."
7. Add a "what happens next" panel to the Project Ready screen.
8. Add derived confidence badges to the review screen (no schema change).
9. Fix the three identified accessibility gaps (label, not placeholder; labelled clarification inputs; structured review headings).

## Long-Term Improvements (not Sprint 1, recorded for future sprint planning)

- Real Project Workspace (dashboard, artifact navigation, Digital Twin visibility, audit history) — [06-project-workspace-review.md](06-project-workspace-review.md).
- Document upload and Document Intelligence (extraction, dedup, conflict detection, version comparison) — [04-document-intelligence-review.md](04-document-intelligence-review.md).
- Extend `RequirementKind` to cover Assumptions/Constraints/Dependencies — [05-generated-artifacts-review.md](05-generated-artifacts-review.md).
- Deeper branching logic in the clarification loop, once real usage data shows binary looping is insufficient — [03-discovery-workshop-review.md](03-discovery-workshop-review.md).

## Features that should move to future releases

Timeline, Cost Estimate, Risk Assessment, Functional Specification, Architecture Summary, document upload, a real Dashboard, a real Project Workspace, an Administration Console — all already mapped to their correct future sprint in [01-user-journey-and-screen-evaluations.md](01-user-journey-and-screen-evaluations.md) and [PLATFORM_MATURITY.md](../../../PLATFORM_MATURITY.md).

## Features intentionally excluded from Sprint 1 (not deferred — actively wrong to build now)

- "Choose Project Type" — no field exists to back it, and it's not meaningful with a single Platform Pack.
- A separate "Approval Screen" distinct from Artifact Review — would add a screen transition with zero new information ([08-wireframes.md](08-wireframes.md)).
- A `TechnologyPack` layer under Platform Pack — already rejected on the merits in [ADR-0023](../../adr/0023-platform-kernel-and-platform-pack-architecture.md), not merely deferred.

## Final Decision

# APPROVED WITH MINOR UX IMPROVEMENTS

Sprint 1 implementation may begin. The "minor UX improvements" are exactly the nine Quick Wins above — all presentation-layer refinements to already-planned screens (SAF-42/47/51) plus one wording fix (SAF-41) — none adds a story, a capability, or expands Sprint 1's scope. No UX redesign is required; the underlying flow, screen sequence, and architecture-to-UX mapping are sound.

## Recommended implementation order

**First Epic: Epic A — Idea Intake.** Not Epic F (Technical Debt & Platform Closure) — SAF-54's `drizzle-orm` fix is a mandatory, parallel prerequisite that gates the persistence stories, but it is infrastructure hygiene, not the epic that proves Sprint 1's business value or its architecture.

**First Story: SAF-39 — `context-requirements` domain (`RequirementDocument`, `Clarification`, `AcceptanceCriterion`).** The only story with zero dependencies on anything not already true today — pure domain logic, zero I/O, the cheapest possible point to start, the same "cheapest possible moment" reasoning Sprint 0 itself used repeatedly.

**First Vertical Slice — deliberately narrower than "a complete screen":** a backend-only walking skeleton proving the riskiest, highest-uncertainty, most architecture-validating assumptions before any UI polish is invested:

```
SAF-39 (domain) → SAF-40 (persistence, gated on SAF-54)
                → SAF-41 (SubmitBusinessIdea)
SAF-43 (real Anthropic LLM call, parallel, independent)
                → SAF-44 (real requirements-analyst invocation)
                → SAF-45 (CapabilityResolverPort's first real adapter)
SAF-48 (Project domain) → SAF-49 (Project persistence, gated on SAF-54)
                → SAF-50 (approve + create Project + emit event)
```

This slice deliberately **excludes** the clarification loop (SAF-46/47) and all three UI screens (SAF-42/47/51) from the *first* pass — it is provable end to end with a demo script (the SAF-53 pattern, run early rather than only at the end) before a single pixel of UI exists. **Why this maximizes business value while validating Sprint 0's architecture:** it is the first time `LlmProviderPort` is exercised against a real external system rather than a mock (closing the single largest "verified vs. proven" gap the Sprint 0 Exit Gate flagged), the first time `CapabilityResolverPort` resolves dynamically rather than being composed directly (proving the Capability Model's actual swappability, not just its shape), and the first time `requirements.document.captured.v1` is emitted for real through the transactional outbox (closing a gap [BASELINE.md](../../../BASELINE.md) explicitly flagged as "designed, not yet emitted"). Every one of these is a real Sprint 0 promise being cashed for the first time — proving the architecture, not just following the ticket order.

Once this skeleton is proven, layer on: the clarification loop (SAF-46/47) next, then the three UI screens (SAF-42/47/51) with this review's nine Quick Wins applied directly during their construction (cheapest possible point to apply them — during first build, not as post-launch rework), then SAF-53's full end-to-end demo, then SAF-55's first real CI run. This order is a refinement of, not a departure from, [docs/backlog/sprint-1-backlog.md](../../backlog/sprint-1-backlog.md)'s own Recommended Implementation Order — narrower on the first slice specifically, to front-load architecture-proving risk ahead of UX-polish investment.

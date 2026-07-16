# Sprint 1 Implementation Order

**Revised 2026-07-16** for the merged, single-slice structure.

## Recommendation

- **First Epic:** Epic 1 — Discovery-to-Project Delivery (the only Epic this sprint).
- **First Vertical Slice:** VS-1 — Discovery Workspace (the only Vertical Slice this sprint).
- **First Engineering Task:** Task 1.3 — `context-requirements` domain (`RequirementDocument`, `Clarification`, `AcceptanceCriterion`), started the same day as Tasks 1.1, 1.2, 1.5, 1.13, and 1.17 (see below) — this document names the single highest-priority task, not the only one that should start on day one.

## Why Task 1.3, not Task 1.13 (Project) or Task 1.17 (Digital Twin) — the other new zero-dependency candidates

The merge added two new zero-dependency starting points that didn't exist in the original plan: Task 1.13 (`Project` domain) and Task 1.17 (`context-digital-twin` domain). Both are real candidates for "first task," and both should start in parallel with Task 1.3 on day one regardless — but asked for a single first task, **Task 1.3 remains the right answer**, for the same reason it was before: it unblocks the most downstream work. Task 1.13 only unblocks Task 1.14 (Project persistence); Task 1.17 only unblocks Task 1.18 (`GraphStorePort` adapter). Task 1.3 unblocks Task 1.4 (persistence), Task 1.6 (the capability implementation, the sprint's highest-complexity task), Task 1.8 (the use case), and everything built on top of those. It is still the cheapest point in the sprint to discover a shape problem before the most expensive work (the real LLM integration, the Digital Twin write path, every UI screen) is built on top of an assumption that turns out wrong.

## Special note on Task 1.17 (Digital Twin domain)

Although Task 1.3 is the recommended single first task, **Task 1.17 deserves the same day-one urgency**, for a reason specific to this revision: it carries Risk #7 ([04-risk-register.md](04-risk-register.md)) — the real possibility that [ADR-0021](../../adr/0021-project-digital-twin-knowledge-graph.md)'s already-approved Digital Twin model doesn't fit cleanly once real implementation starts, since it's being built for the first time, ahead of its originally planned sprint, under this sprint's schedule pressure. Discovering that early (day one, alongside 1.3) leaves the most possible time to stop and recommend an ADR revision if needed, rather than discovering it once Task 1.19 (the write integration) is already underway and the rest of the workflow (Task 1.20) is waiting on it.

## Why this maximizes business value while validating the greatest number of platform capabilities with the least implementation effort

Re-derived for the merged slice, not assumed to carry over unexamined from the prior structure:

- **Business value:** unchanged in kind — VS-1 still delivers the platform's single most distinctive claim, AI-guided discovery — but now delivers *more* of it in one slice: the full "idea to approved, Digital-Twin-traced project" promise, not half of it.
- **Capabilities validated:** everything the original plan validated (real `LlmProviderPort` usage, dynamic `CapabilityResolverPort` resolution) **plus** the first real exercise of `GraphStorePort` and the Digital Twin's actual node/relationship model — a third previously-unproven port now proven in the same sprint, not deferred to Sprint 7.
- **Least implementation effort for what's validated:** Task 1.3 still costs almost nothing (pure domain, no I/O) yet unblocks the most; the day-one parallel start of six independent tasks ([03-dependency-map.md](03-dependency-map.md)) keeps the added Digital Twin scope from simply extending the sprint's total calendar time — it fills the same parallel-capacity slots the original plan already had room for.

## Sequencing principle, reaffirmed

**Start with the task that has the most downstream tasks depending on it and the least cost to get right early.** This principle didn't change with the merge — it just now has to be applied against a larger, riskier set of candidates (six day-one starting points instead of five), and it still points to the same answer: the small, boring, foundational domain task, not the most novel or most visible one.

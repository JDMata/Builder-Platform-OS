# Sprint 1 Implementation Order

**Revised 2026-07-17** for the corrected, PDR-synchronized task list.

## Recommendation

- **First Epic:** Epic 1 — Discovery-to-Project Delivery (the only Epic this sprint).
- **First Vertical Slice:** VS-1 — Discovery Workspace (the only Vertical Slice this sprint).
- **First Engineering Task:** Task 1.3 — `context-requirements` domain (`RequirementDocument`, `Clarification`, `AcceptanceCriterion`), started the same day as Tasks 1.1, 1.2, 1.5, and 1.12.

## Why Task 1.3, not Task 1.12 (Project) — the other zero-dependency candidate

Two tasks have zero dependencies and unblock meaningful downstream work: 1.3 (Requirements domain) and 1.12 (Project domain). Both should start in parallel on day one. Asked for a single first task, **Task 1.3** remains the answer: it unblocks Task 1.4 (persistence), Task 1.6 (the capability implementation — the sprint's highest-complexity task), and Task 1.8 (the use case) — more downstream work than Task 1.12 unblocks (only Task 1.13). It is also the cheapest point in the sprint to discover a shape problem before the most expensive work (the real LLM integration, every UI screen) is built on top of it.

## Why this is simpler and lower-risk than the 2026-07-16 revision's answer

The previous revision's implementation order carried the same recommendation (Task 1.3 first) but surrounded it with additional day-one candidates (Task 1.13, the Digital Twin domain) and a longer critical path running through a pulled-forward `context-digital-twin`/`GraphStorePort` implementation. With that scope reverted, the day-one parallel set shrinks from six tasks to five, and the critical path shortens correspondingly ([03-dependency-map.md](03-dependency-map.md)) — the sprint now validates exactly the platform capabilities the Product Design Review asked it to (real `LlmProviderPort` usage, dynamic `CapabilityResolverPort` resolution), no more, no less.

## Why this maximizes business value while validating the greatest number of platform capabilities with the least implementation effort

- **Business value:** VS-1 delivers Sprint 1's single most distinctive claim — AI-guided discovery — exactly as the Product Design Review validated it, without the risk of building screens or fields (Dashboard, Project Type) that were never approved and would need to be reworked or removed later.
- **Capabilities validated:** the first real exercise of `LlmProviderPort` against an external system (Task 1.5), and the first dynamic resolution through `CapabilityResolverPort` (Task 1.7) — both previously-unproven, both still validated by this corrected plan.
- **Least implementation effort for what's validated:** Task 1.3 costs almost nothing (pure domain, no I/O) yet unblocks the most; removing the Digital Twin/Dashboard/Project-Type scope removes effort that was never validating anything the Product Design Review actually asked for.

## Sequencing principle, reaffirmed

**Start with the task that has the most downstream tasks depending on it and the least cost to get right early.** Unchanged by this correction — the correction just removes tasks that didn't belong in the sequence at all, rather than changing the principle itself.

# Sprint 1 Implementation Order

## Recommendation

- **First Epic:** Epic 1 — Idea Capture & AI-Guided Structuring.
- **First Vertical Slice:** VS-1 — Capture and Structure a Business Idea.
- **First Engineering Task:** Task 1.3 — `context-requirements` domain (`RequirementDocument`, `Clarification`, `AcceptanceCriterion`).

## Why Epic 1 / VS-1, not Epic 2 / VS-2

There is no real choice here: Epic 2 has nothing to approve until Epic 1 produces a resolved `RequirementDocument` ([03-dependency-map.md](03-dependency-map.md)'s Epic-dependency section). The interesting decision is *which task within VS-1* to start with, and *how to sequence the rest of VS-1* to front-load the sprint's real risk — not which Epic goes first.

## Why Task 1.3, not Task 1.1, 1.2, 1.5, or 2.1 (the other zero-dependency candidates)

Five tasks have zero dependencies and could start on day one: 1.1 (login), 1.2 (CVE fix), 1.3 (domain), 1.5 (real LLM call), 2.1 (Project domain). All five *should* start in parallel, per [03-dependency-map.md](03-dependency-map.md)'s recommended order — but asked for a single "first task," **Task 1.3** is the right answer because it is the one task every other task in the sprint's critical path is downstream of. Task 1.4 (persistence), Task 1.6 (capability implementation), Task 1.8 (use case), and everything after them all need `RequirementDocument`/`Clarification`/`AcceptanceCriterion`'s shape decided first. Starting here — pure domain logic, zero I/O, zero external dependency, unit-testable in milliseconds — is the same "cheapest possible moment to correct the shape" reasoning Sprint 0 itself used repeatedly (e.g., [ADR-0022](../../adr/0022-capability-model-provider-abstraction.md)'s own justification): if anything about these three aggregates' shape is wrong, this is the cheapest point in the sprint to discover it, before persistence, the agent, or any UI is built on top of an assumption that turns out wrong.

## Why VS-1 as a whole maximizes business value while validating the greatest number of platform capabilities with the least implementation effort

This is the same question the Product Design Review's Executive Design Review already answered for the *previous* level of granularity (Epic/Story/Slice); this document re-derives it at the task level, for consistency, rather than assuming the prior answer transfers unexamined:

- **Business value:** VS-1 delivers the platform's single most distinctive claim — "AI-guided discovery" — the one capability nothing else in Sprint 1 (or Sprint 0) has demonstrated yet. VS-2, by contrast, is valuable but architecturally unsurprising (domain + persistence + event emission, patterns Sprint 0 already proved three times over for other aggregates).
- **Capabilities validated:** VS-1 is the first sprint-1 exercise of `LlmProviderPort` against a real external system (Task 1.5) — closing the single largest "verified vs. proven" gap the Sprint 0 Exit Gate flagged (`AnthropicLlmAdapter` had "mocked responses only, no real LLM traffic yet," per [BASELINE.md](../../../BASELINE.md)). It's also the first dynamic (not directly-composed) resolution through `CapabilityResolverPort` (Task 1.7) — proving the Capability Model's actual swappability, not just its shape. VS-2 validates real patterns too (the transactional outbox handling a new event type) but nothing as previously-unproven as VS-1's two.
- **Least implementation effort for what's validated:** Task 1.3 in particular costs almost nothing (pure domain, no I/O) yet unblocks everything downstream — the highest validation-per-effort ratio of any single task in the sprint.

## Sequencing principle established here, applicable beyond Sprint 1

**Start with the task that has the most downstream tasks depending on it and the least cost to get right early — not the task that looks most impressive in a demo.** Task 1.3 is genuinely unglamorous (three small aggregates, no UI, no AI) — exactly why it should go first: cheap to build, cheap to fix if wrong, and everything expensive (the real LLM integration, the capability resolver, the UI) is safer to build once it's settled.

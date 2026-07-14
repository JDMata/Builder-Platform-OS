# Definition of Ready

A backlog item may be pulled into a sprint/iteration only when every applicable item below is true. The point of this checklist is to catch ambiguity and hidden architectural risk *before* implementation starts, not during code review — a story that fails this checklist and gets built anyway tends to produce the exact kind of undiscussed scope and rework that erodes the [Maintainability over speed](ENGINEERING_PRINCIPLES.md) principle.

## Clarity

- [ ] The story has a clear, testable acceptance criteria list — not just a one-line description. "Users can generate a Fiori app" is not ready; "given a validated requirement document, triggering generation produces an `Artifact` of type X with properties Y, and a `ReviewGate` is created" is.
- [ ] The story is traceable to a requirement, epic, or explicit product decision — not "seemed like a good idea." This is the PMO-alignment principle made concrete at the story level.
- [ ] Any UI/API contract the story depends on or produces is defined (even in draft form) before implementation starts — consistent with API First.

## Scope and size

- [ ] The story is small enough to be completed, reviewed, and merged within one iteration. A story that clearly isn't gets split before it enters the sprint, not partially implemented and carried over silently.
- [ ] Dependencies on other in-flight stories, packages, or ports are identified and either resolved or explicitly sequenced.

## Architectural impact assessed

- [ ] Someone has asked "does this need an ADR?" against [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md)'s criteria, and the answer (yes, with a draft ADR attached, or no, with a one-line reason) is recorded on the story.
- [ ] If the story touches a port's public interface, its known consumers are identified so the review can include them.
- [ ] If the story introduces a new external dependency (a vendor SDK, a new MCP server type, a new LLM provider), it's clear which adapter package it belongs in and that no core/domain code will need to reference it directly.

## Testability

- [ ] The test approach is identified: what's covered by domain unit tests, what needs a contract test, what (if anything) needs an integration/E2E test. A story with no clear way to verify it's done except "looks right" is not ready.
- [ ] Any new external dependency has a fake/in-memory test double planned, so domain/application tests don't end up requiring a live service.

## Security & data impact considered

- [ ] If the story touches authentication, authorization, secrets, target-system credentials, or data crossing a tenant boundary, that's flagged explicitly and reviewed against [SECURITY_BASELINE.md](SECURITY_BASELINE.md) before work starts, not discovered during code review.
- [ ] If the story introduces or changes what PII is stored, the retention/erasure implications are considered against [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md) and [ADR-0017](docs/adr/0017-data-retention-crypto-shredding.md).

## No blocking unknowns

- [ ] Any open question that would change the implementation approach (not just its details) is answered before the story is pulled in — an unresolved "we're not sure if X or Y" is a spike, not a ready story.
- [ ] Design/UX assets (if the story has a UI component) are available or explicitly not required for this story.

A story that's missing one of the above isn't rejected outright — it goes back with the specific gap named, so refinement is a fast, targeted conversation rather than a vague "not ready yet."

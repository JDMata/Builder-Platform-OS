# Session Startup Policy

This document governs how every future session — human or AI, in this repository — begins. Its purpose is narrow: prevent a session from starting work against a stale mental model of the roadmap, an out-of-date architecture assumption, or a story that isn't actually the current sprint's.

## Required reading order

Every session must read the following, in this order, before writing or proposing any code:

1. **[ENGINEERING_PRINCIPLES.md](ENGINEERING_PRINCIPLES.md)** — the non-negotiable architectural principles and the Engineering Planning Principles that govern how sprints are planned and closed.
2. **[PROJECT_CONTEXT.md](PROJECT_CONTEXT.md)** — the living operational state: current sprint, current stories, current risks, current decisions, architecture freeze status.
3. **[ROADMAP.md](ROADMAP.md)** — the product roadmap this sprint's work must trace back to, and the engineering/release/future-ideas views that must not be confused with it.
4. **[BASELINE.md](BASELINE.md)** — the frozen Sprint 0 architecture baseline everything since is built on top of.
5. **[ARCHITECTURE_FREEZE.md](ARCHITECTURE_FREEZE.md)** — exactly what is frozen, what remains free to change, and what requires an ADR.
6. **[ARCHITECTURE_DECISION_INDEX.md](ARCHITECTURE_DECISION_INDEX.md)** — the full ADR list and status; confirms nothing is `Proposed` or pending that would affect the current sprint's work.
7. **[PROJECT_PLAYBOOK.md](PROJECT_PLAYBOOK.md)** — the operational handbook for how to actually do the work: sprint process, review process, how to introduce a new context/capability/plugin/agent, incident/change/drift management.
8. **Current ADRs** relevant to the area about to be touched — read the specific ADR(s) under [docs/adr/](docs/adr/), not just their one-line index entry.

## Verification checklist before any implementation work begins

- [ ] Determine the active sprint and its in-scope stories from [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — not from [ROADMAP.md](ROADMAP.md) or the backlog directly.
- [ ] Verify the Architecture Freeze is still in effect and unchanged since [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) was last updated.
- [ ] Verify the requested work does not require an ADR. If it plausibly does, stop and follow [PROJECT_PLAYBOOK.md](PROJECT_PLAYBOOK.md)'s Architecture Review Process before writing implementation code — do not implement speculatively while the question is still open.
- [ ] Confirm the requested work is in scope for the *current* sprint, not a future sprint pulled forward without planning, and not a past sprint's leftover work being resumed without being re-added to the current sprint's stories.
- [ ] If the requested work isn't in [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) at all, treat that as a signal to check with the user before proceeding, not as implicit authorization to expand scope.

## The one rule that matters most

**Always begin from [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md), never from [ROADMAP.md](ROADMAP.md) or the backlog directly.** The roadmap says what the platform intends to build across many sprints; the backlog says what could conceivably be worked on; only [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) says what is actually in flight right now. Starting from anywhere else is how a session ends up building next sprint's feature during this sprint, or resuming an architectural discussion that was already closed.

## Scope of this policy

This governs session startup only. It does not replace the Sprint Exit Gate, the Architecture Review Process, or any other process step defined in [PROJECT_PLAYBOOK.md](PROJECT_PLAYBOOK.md) — those apply during and at the end of a sprint, this applies at the beginning of a session.

# ADR Template

Copy this into `docs/adr/NNNN-kebab-title.md`, where `NNNN` is the next sequential, zero-padded number — see [docs/adr/README.md](docs/adr/README.md) for the index and current numbering. See [TECHNICAL_DEBT_POLICY.md](TECHNICAL_DEBT_POLICY.md) for when an ADR is required.

```markdown
# NNNN — Title
Status: Proposed | Accepted | Superseded by NNNN
Date: YYYY-MM-DD

## Context
## Decision
## Consequences
## Alternatives considered
```

## How to fill each section

- **Title**: a short noun phrase naming the decision, not the problem (`Event-driven core via Postgres transactional outbox`, not `How should contexts communicate?`).
- **Status**: starts `Proposed`. Only changes to `Accepted` after the review this project's operating agreement requires. If rejected or replaced, change to `Superseded by NNNN` and write the replacement ADR — never delete a rejected ADR; the reasoning trail (including why the first approach failed) is the point.
- **Context**: the forces at play — what constraint, requirement, or tension makes a decision necessary here. State the problem so a reader with no prior context understands why this couldn't be skipped. Reference the specific scale/requirement that makes it matter if relevant (e.g., "at 500+ projects, X becomes true").
- **Decision**: the one sentence (expandable to a short paragraph) stating what was chosen, stated as a decision, not a menu. Include the concrete mechanism (a port name, a schema name, a specific tool) — vague decisions ("we'll use good caching practices") are not decisions.
- **Consequences**: both the benefits and the costs accepted. A Consequences section with no costs in it is a sign the alternatives weren't seriously considered. Include what this decision makes easier *and* what it makes harder or forecloses.
- **Alternatives considered**: at least two real alternatives, each with a one-line reason it was rejected. "We didn't consider anything else" is itself information — write it as an alternative ("no abstraction at all") and say why it lost.

## Revising a still-Proposed ADR

If new information changes an ADR that hasn't been `Accepted` yet, don't silently rewrite the Decision section — add a dated `## Review update (YYYY-MM-DD)` section below Alternatives, explaining what changed and why, with a link to whatever review or incident triggered it. See [docs/adr/0008-workflow-engine-in-house-first.md](docs/adr/0008-workflow-engine-in-house-first.md) for a worked example. This keeps the decision's history legible without needing a new ADR number for every refinement of a question still open.

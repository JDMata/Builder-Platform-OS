---
id: ambiguous-requirement
kind: escalation
version: 1
status: draft
---

# Policy: Ambiguous requirement

## Condition
An agent processing requirement intake cannot structure part of the input into a testable `Requirement`/`AcceptanceCriterion` with reasonable confidence — including contradictory statements, missing measurable criteria, or terminology it cannot resolve via `knowledge-retrieval`.

## Action
Raise a `Clarification` against the `RequirementDocument`, addressed to the human owner of the `Project`. The workflow run does not pause for this — a `Clarification` is recorded as open, and the run continues with the rest of the requirement while that one question is outstanding, unless the workflow definition's own steps depend on the ambiguous part.

## Applies to
- `agents/requirements-analyst`

## Rationale
An agent that guesses at ambiguous requirements produces a confidently wrong `RequirementDocument` that downstream steps (architecture, generation) will build on without knowing it's shaky — silently expensive to unwind later. Raising a `Clarification` costs one round-trip to a human now instead of a wrong generation run discovered much later.

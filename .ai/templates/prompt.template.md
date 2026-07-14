---
agent: <agent-id>                # must match an id in .ai/agents/
version: 1                        # matches the vN/ folder this file lives in — immutable once published
model_profile_compatibility:      # logical ModelProfile names this prompt has been validated against (see docs/architecture/02-domain-model.md, LLM Gateway context)
  - reasoning-large
status: draft | active | deprecated
---

# Prompt: <Agent Display Name> — v<N>

## Change from previous version
(Omit for v1.) One or two sentences: what changed and why. Link the ADR/incident/eval result that motivated it, if any — a prompt version bump with no stated reason is a debt flag, same as an undocumented ADR revision.

## System prompt

<the actual system prompt text>

## Shared fragments used
List any fragments pulled in from [`_shared/`](../_shared/) by name, rather than pasting their content here — a fragment exists specifically so N prompts don't duplicate (and independently drift on) the same boilerplate (standard safety preamble, standard output-format instructions, standard tool-use conventions).

- `_shared/<fragment-name>`

## Evaluation notes
How this version was validated before being marked `active` (a golden-set eval, a human review, a shadow-run comparison against the prior version). Not a full eval report — a pointer to where that lives.

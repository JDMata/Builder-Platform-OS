# Prompts

One subfolder per agent id, containing immutable, numbered versions (`v1/`, `v2/`, ...). A prompt version is never edited in place once it's referenced by a published `agent.md` — a change is always a new version folder, so any `AgentInvocation` recorded against `v1` remains reproducible forever, matching the platform's existing rule that a `WorkflowRun` pins the exact prompt version it used (see [02-domain-model.md](../../docs/architecture/02-domain-model.md) aggregate design rule 6).

Each version folder holds a `system.md` (or more files, if a prompt is composed of multiple parts) following [templates/prompt.template.md](../templates/prompt.template.md).

## `_shared/`

Reusable fragments (a standard tool-use preamble, a standard output-format instruction block, a standard safety/refusal boundary) referenced by name from individual prompts, never copy-pasted. This is the same "factor it once, reference it everywhere" rule already applied to `generated-app-kit` ([ADR-0019](../../docs/adr/0019-execution-profiles-for-generated-applications.md)) and the LLM/MCP resilience wrapper ([ADR-0016](../../docs/adr/0016-mandatory-resilience-patterns.md)) — without it, "dozens of specialized agents" means dozens of independently drifting copies of the same boilerplate.

## Promotion

A prompt version starts `draft`, moves to `active` only after the evaluation step named in its own file, and is marked `deprecated` (never deleted) once superseded — mirroring ADR status lifecycle discipline.

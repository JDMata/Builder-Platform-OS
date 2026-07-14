# Shared prompt fragments

Reusable blocks referenced by name from individual agent prompts (see [../README.md](../README.md)). Kept here instead of duplicated so a change to, say, the standard tool-use preamble updates every agent that references it, deliberately, in one PR — rather than N agents drifting independently.

## `tool-use-preamble`

Illustrative placeholder for the standard instruction block every agent's prompt includes about how to call MCP tools within its declared allow-list, and what to do when a tool call fails or is denied (escalate per the agent's `escalation` policy, never retry silently past the platform's own resilience wrapper — see [ADR-0016](../../docs/adr/0016-mandatory-resilience-patterns.md)).

## `output-format-instructions`

Illustrative placeholder for the standard instruction block telling an agent to emit its declared `Outputs` shape as structured data, plus what to do when it cannot confidently produce that shape (raise a `Clarification` / escalate, never emit a best-effort guess silently).

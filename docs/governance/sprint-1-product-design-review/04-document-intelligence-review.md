# Document Intelligence Review

**Status: not a Sprint 1 capability.** No document-upload story exists in [docs/backlog/sprint-1-backlog.md](../../backlog/sprint-1-backlog.md), and this review does not recommend adding one — Sprint 1's text-only idea intake (SAF-42) is an honest, complete MVP for Discovery without it. This section validates the target-state design for a future sprint, per the review's instruction to evaluate the full journey.

## Why text-only is the right Sprint 1 scope, not a shortcut

Document upload without real extraction/gap-analysis logic behind it would collect files nothing reads — the review's own "generate less, but don't fake it" standard applies here exactly as it does to Timeline/Cost/Risk. Building the upload widget ahead of the intelligence that makes it useful would be horizontal work with no consumer this sprint, the same category of premature work the Engineering Planning Principles rule out.

## Target-state evaluation

| Capability | Automatic, or requires confirmation? | Reasoning |
|---|---|---|
| **Requirement extraction** (from Word/PDF/Excel/Markdown) | Automatic first pass, **always followed by the same human-reviewable Clarification/review flow Sprint 1 already builds** — never auto-approved. | Extraction is exactly the same job the `requirements-analyst` agent already does for free-text idea input; a document is just a second input modality feeding the same structuring capability, not a new agent or capability. |
| **Requirement refinement** | Automatic re-pass on new information, same as SAF-46's answer-triggered re-structuring. | No new mechanism — an uploaded document's content is additional context for the same loop. |
| **Gap analysis** (what does this document NOT cover, relative to a complete requirement set) | Automatic detection, surfaced as `Clarification`s — never silently filled in. | Matches the existing "never guess, raise a Clarification" rule exactly; a gap is just another kind of ambiguity. |
| **Duplicate detection** (two uploaded documents, or a document and the free-text idea, describing the same requirement) | Automatic flagging, **requires user confirmation to merge or keep separate.** | Merging two requirements is a judgment call with business consequences (losing nuance if wrongly merged) — never automatic. |
| **Conflicting requirement detection** (two sources disagree) | Automatic detection, **always surfaced as a `Clarification`**, never silently resolved in either direction. | A conflict is definitionally something the agent cannot resolve with confidence — it's the same Escalation rule Sprint 1 already has, applied to a second input source. |
| **Missing information detection** | Automatic — identical mechanism to Sprint 1's existing `Clarification` flow. | No new concept; a document with a gap raises the same kind of question free-text input already does. |
| **Version comparison** (a re-uploaded, updated document) | Automatic diff computation; **requires confirmation before applying changes to already-approved requirements** (an approved `RequirementDocument` is frozen per SAF-50's own rule — a new version reopens Discovery, it doesn't silently mutate an approved artifact). | Protects the same approval integrity Sprint 1's Approval gate already protects. |
| **Document traceability** | Automatic and mandatory, no confirmation needed — every extracted `Requirement` should carry a reference back to its source document/passage. | This is exactly the Digital Twin's job once it exists (Sprint 7) — until then, satisfied the same way Sprint 1 satisfies it for text input: audit events and backlog-entry-level traceability, not a new mechanism. |

## What this means architecturally (confirmed, not changed)

Document intake is additive to the existing Requirements Intake context and the existing `structure-business-requirement` capability — it needs a new input adapter (parsing Word/PDF/Excel/Markdown into text/structured content the same agent already consumes), not a new bounded context, a new agent, or a new capability model. This is confirmed here as a validation of the target design's soundness, not a decision to build it now.

## Recommendation

No action for Sprint 1. When a future sprint schedules this (a natural fit once Sprint 1's text-only path has real usage to learn from), the "automatic vs. requires confirmation" table above should be the starting point for that sprint's own backlog — every "requires confirmation" row is a human-approval gate, never a silent write to an approved artifact.

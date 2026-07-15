# Project Workspace Review

**Status: not a Sprint 1 screen.** Sprint 1 ends at the "Project Ready" confirmation screen ([01-user-journey-and-screen-evaluations.md](01-user-journey-and-screen-evaluations.md)) — a full Project Workspace, as "the central operating console for the project," is Future work, naturally arriving once there's more than a bare `Project` record to operate on (Sprint 2's generated documentation, Sprint 3's generated applications, etc.). This section validates the target-state design, per the review's instruction to evaluate the complete journey.

## Target-state facet evaluation

| Facet | Target-state evaluation |
|---|---|
| **Project Dashboard** | Should summarize: current phase (Discovery complete / Documentation in progress / etc.), the most recent artifact generated, and any pending approval — a status view, not a data-entry screen. |
| **Artifact navigation** | Organized by artifact type (Requirements, Functional Spec, Architecture, Generated Code, Tests, Demo) as each becomes real — matching the target Information Architecture's `Project → [Charter, Requirements, Artifacts, ...]` shape ([02-information-architecture.md](02-information-architecture.md)). |
| **Digital Twin visibility** | Should surface traceability queries ("what does this requirement produce downstream?") once `context-digital-twin` exists (Sprint 7, SAF-34–37) — until then, correctly absent rather than faked with a placeholder graph. |
| **Workflow status** | Should show the current `WorkflowRun` status for any in-flight generation — reusing the same `WorkflowRunStatus` values (`pending`/`running`/`awaiting_approval`/`completed`/`failed`/`cancelled`) Sprint 1's own Discovery workflow already uses, not a new status vocabulary. |
| **Project health** | A composite signal (open risks, stale approvals, failed workflow runs) — meaningful only once Risk (Sprint 7) and multiple workflow types exist; premature before then. |
| **Timeline** | See [05-generated-artifacts-review.md](05-generated-artifacts-review.md) — Future, not yet designed in detail. |
| **Approvals** | A history of every approval gate the project has passed (Discovery approval first, Functional Spec approval later, etc.) — Sprint 1's single approval event is this list's first real entry once the Workspace exists. |
| **Version history** | Every `ArtifactVersion` once artifacts exist (Sprint 2+) — `RequirementDocument`'s own approval-freezes-it rule (see Generated Artifacts Review) is this concept's first real instance. |
| **Audit history** | Should surface the Governance context's `AuditEvent` stream for this project — the mechanism already exists (Sprint 0's Governance context), only the UI to view it per-project doesn't. |
| **Recent activity** | A simple reverse-chronological feed of the project's own events (`requirements.document.captured.v1` today; more event types as more capabilities ship) — no new event model needed, just a UI reading the existing outbox-delivered stream. |
| **AI recommendations** | Once more than one capability exists, a place to surface "here's what I'd suggest next" (e.g., "Generate a Functional Specification from this Project" as a one-click action) — matches the Capability Model's design intent directly (a capability request initiated from the Workspace, not hardcoded to a specific agent). |
| **Future implementation visibility** | A clear, honest "not yet available" state for capabilities the roadmap plans but hasn't built — critical for the Enterprise Product Assessment's "feels like a platform, not a one-shot tool" concern; should never silently hide unimplemented capabilities as if they don't exist, and never fake them as if they do. |

## Recommendation for Sprint 1 (the only actionable one)

The "Project Ready" confirmation screen, already planned for Sprint 1, should include a minimal, static preview of this future console — a short "what happens next" panel (already recommended in [01-user-journey-and-screen-evaluations.md](01-user-journey-and-screen-evaluations.md)) that sets the expectation a real Project Workspace is coming, without building any part of it now. This is copy, not engineering — it costs nothing and directly prevents the "dead end" feeling the Enterprise Product Assessment flags as a risk.

## Confirmed design principle for whichever future sprint builds this

**The Project Workspace should read state, never own it.** Every facet above (workflow status, audit history, approvals) is already produced by an existing bounded context (Workflow, Governance, Requirements Intake) — the Workspace is a composed *view*, not a new source of truth, consistent with the read-models pattern already designed (ADR-0014, CQRS-lite read models) rather than a new write-side concept.

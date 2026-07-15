# Information Architecture

## Complete target IA

```
Workspace
├── Projects
│   └── [Project]
│       ├── Charter (approved RequirementDocument + AcceptanceCriteria)      [SPRINT 1]
│       ├── Requirements                                                     [SPRINT 1]
│       ├── Artifacts (FS/TS/Architecture/generated code/tests/demo)         [FUTURE — Sprint 2+]
│       ├── Timeline / Cost / Risk                                           [FUTURE — Sprint 5+/7]
│       ├── Approvals (history)                                             [SPRINT 1, minimal]
│       ├── Digital Twin (traceability graph)                               [FUTURE — Sprint 7]
│       └── Workflow / Audit history                                        [SPRINT 1, minimal — see below]
├── Discovery (in-flight sessions not yet approved into a Project)           [SPRINT 1]
├── Templates                                                                [FUTURE — no template catalog exists yet]
└── Administration
    ├── Settings (tenant, workspace)                                        [Sprint 0 — exists via Identity & Access context]
    ├── Users & Roles                                                        [Sprint 0 — RBAC/ABAC exists, no admin UI yet]
    └── Audit                                                                [FUTURE — Governance context exists, no UI]
Help                                                                         [FUTURE]
```

## What Sprint 1 actually needs from this tree

Sprint 1's real IA is much shallower than the full tree above — and should stay that way. A new user's actual navigable surface in Sprint 1 is:

```
(Login)
  → Discovery Workspace (the idea-submission screen — the de facto "home" for a user with no projects yet)
      → Clarification loop
      → Project Charter (review & approve)
          → Project Ready (confirmation)
```

There is no persistent top-level navigation chrome (no sidebar with "Workspace / Projects / Templates / Administration") in Sprint 1 — and there shouldn't be. Building navigation chrome for sections that don't exist yet (Templates, Artifacts, Digital Twin, Administration) would be exactly the "horizontal work with no consumer this sprint" the Engineering Planning Principles rule out. A single, linear, four-screen flow is the correct information architecture for a sprint whose entire scope is "idea to approved project."

## Is the navigation intuitive?

For Sprint 1's actual scope: **yes** — a strictly linear flow has no navigation to get wrong. The only structural question worth flagging is the "Project Ready" screen's "View Project" action, which currently leads nowhere (see [01-user-journey-and-screen-evaluations.md](01-user-journey-and-screen-evaluations.md)) — recommended fix is copy-only (a "what happens next" panel), not a navigation target that doesn't exist yet.

## Recommended simplification

None needed for Sprint 1 beyond what's already scoped — the flow is already minimal. The one thing to actively avoid: **do not build a navigation shell (sidebar, top nav, breadcrumbs) ahead of having more than one destination to navigate between.** When Sprint 2 adds a second real destination (a Documentation Factory screen), that is the correct moment to introduce the first real piece of persistent navigation chrome — not before.

## Forward note for Sprint 2+ IA design

When a second destination exists, the IA should organize around **Workspace → Project → [Charter, Requirements, Artifacts, ...]** exactly as the target tree above shows — `Project` as the central navigable unit, matching the Project Workspace's intended role as "the central operating console" (see [06-project-workspace-review.md](06-project-workspace-review.md)). This is a design note for a future sprint's own Product Design Review, not a Sprint 1 recommendation.

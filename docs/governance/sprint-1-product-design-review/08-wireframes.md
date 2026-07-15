# Low-Fidelity Wireframes

Layout, navigation, and information hierarchy only — no color or visual styling, per the review's instruction. Each wireframe is tagged **[SPRINT 1]** (real, in the approved backlog) or **[FUTURE]** (target-state design, not built this sprint).

## 1. Dashboard [FUTURE — Sprint 2+]

```
┌──────────────────────────────────────────────────────────────┐
│ SAP App Factory          Workspace: [ Acme Retail Ops ▾ ]    │
├──────────────┬─────────────────────────────────────────────┤
│ Projects      │  Your Projects                                │
│ Discovery     │  ┌─────────────────────────────────────────┐ │
│ Templates     │  │ Shift-End Stock Reconciliation           │ │
│ Administration│  │ Phase: Documentation in progress          │ │
│               │  └─────────────────────────────────────────┘ │
│               │                                                │
│               │  [ + Start New Discovery ]                    │
└──────────────┴─────────────────────────────────────────────┘
```
Empty state for a brand-new user (zero projects) would show only the "+ Start New Discovery" action and no list — the reason Sprint 1 skips this screen entirely and routes straight to Discovery instead (see [02-information-architecture.md](02-information-architecture.md)).

## 2. Create Project Wizard [FUTURE — superseded by design, not just deferred]

```
┌──────────────────────────────────────────────────────────────┐
│  Create Project — Step 1 of ?                                 │
├──────────────────────────────────────────────────────────────┤
│  (This screen does not exist in the target design.)           │
│                                                                │
│  A Project is created as the OUTCOME of an approved Discovery │
│  session (see 01-user-journey-and-screen-evaluations.md),      │
│  never as an upfront form. Shown here only because the        │
│  review explicitly asked for this wireframe — the             │
│  recommendation is not to build it, in any future sprint.      │
└──────────────────────────────────────────────────────────────┘
```

## 3. Discovery Workshop [SPRINT 1 — SAF-42]

```
┌──────────────────────────────────────────────────────────────┐
│  SAP App Factory · Discovery Workspace                       │
├──────────────────────────────────────────────────────────────┤
│  Describe your business idea                                  │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ e.g. "We need a way for warehouse staff to reconcile      ││
│  │ physical stock counts against SAP inventory records..."   ││
│  │                                                            ││
│  └──────────────────────────────────────────────────────────┘│
│  Workspace: [ Acme Retail Ops ▾ ]                             │
│                                          [ Start Discovery ]  │
└──────────────────────────────────────────────────────────────┘
```
Full detail, including the clarification-loop screen this leads to: [docs/ux/sprint-1-discovery-workspace.md](../../ux/sprint-1-discovery-workspace.md).

## 4. Project Summary [SPRINT 1 — the "Project Ready" confirmation screen]

```
┌──────────────────────────────────────────────────────────────┐
│  Discovery Workspace · Project Created                       │
├──────────────────────────────────────────────────────────────┤
│  ✓ Project created: "Shift-End Stock Reconciliation"           │
│                                                                │
│  Workspace:        Acme Retail Ops                            │
│  Requirements:      3 (linked)                                │
│                                                                │
│  What happens next:                                            │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ Future sprints will generate documentation, applications, ││
│  │ tests, and deployment pipelines from this Project.         ││
│  └──────────────────────────────────────────────────────────┘│
│                                        [ View Project ]        │
└──────────────────────────────────────────────────────────────┘
```
The "What happens next" panel is this review's recommended addition (see [01](01-user-journey-and-screen-evaluations.md), [06](06-project-workspace-review.md)).

## 5. Artifact Review [SPRINT 1 — part of SAF-51]

```
┌──────────────────────────────────────────────────────────────┐
│  Discovery Workspace · Review & Approve                      │
├──────────────────────────────────────────────────────────────┤
│  Structured from your idea:                                    │
│                                                                │
│  ▸ Requirement (functional) — High confidence                  │
│    Reconcile physical stock counts against SAP inventory.      │
│      Acceptance criteria:                                      │
│      • System compares counted vs. system quantity per SKU.    │
│                                                                │
│  ▸ Requirement (non-functional) — High confidence               │
│    Reconciliation must complete within the shift-close window. │
│                                                                │
│         [ Request Changes ]           [ Approve & Create Project ] │
└──────────────────────────────────────────────────────────────┘
```
"High confidence" badges are this review's recommended addition, derived from existing data (see [01](01-user-journey-and-screen-evaluations.md)'s Requirement Confidence section) — no new schema field.

## 6. Approval Screen [SPRINT 1 — same screen as Artifact Review]

Sprint 1 deliberately does not split Artifact Review and Approval into two separate screens — the approve action lives directly on the review screen above, since there is nothing additional an "approval-only" screen would show that the review screen doesn't already display. Splitting them would add a screen transition with no new information, which the review's own "eliminate unnecessary friction" instruction argues against.

## 7. Project Workspace [FUTURE — Sprint 2+]

```
┌──────────────────────────────────────────────────────────────┐
│  Project: Shift-End Stock Reconciliation                      │
├──────────────┬─────────────────────────────────────────────┤
│ Charter        │  Status: Documentation in progress            │
│ Requirements   │  Recent activity:                              │
│ Artifacts      │   • Functional Spec generation started         │
│ Approvals      │   • Discovery approved → Project created       │
│ Audit          │                                                │
│               │  [ Generate Functional Specification ]  (AI     │
│               │   recommendation, one click — Capability Model) │
└──────────────┴─────────────────────────────────────────────┘
```
Full facet-by-facet target design: [06-project-workspace-review.md](06-project-workspace-review.md).

## 8. Administration Console [FUTURE — no admin UI story exists yet]

```
┌──────────────────────────────────────────────────────────────┐
│  Administration                                                │
├──────────────┬─────────────────────────────────────────────┤
│ Users & Roles │  (Backed by Sprint 0's real RBAC/ABAC —        │
│ Workspaces    │   context-identity + policy-as-code already    │
│ Audit Log     │   exist; only this UI doesn't yet.)             │
│ Settings      │                                                │
└──────────────┴─────────────────────────────────────────────┘
```
Not needed for Sprint 1 — a single-workspace, single-user Discovery flow has no administrative surface to manage yet.

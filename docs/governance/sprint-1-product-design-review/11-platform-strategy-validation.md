# Platform Strategy Validation

Validates every Sprint 1 screen against the Kernel/Platform Pack boundary [ADR-0023](../../adr/0023-platform-kernel-and-platform-pack-architecture.md) established. **This is a validation exercise only** — Sprint 1 remains exclusively SAP-focused, no other enterprise platform is introduced, and no Sprint 1 scope changes as a result of this section.

## Per-screen responsibility assignment

| Screen | Kernel responsibility | SAP Platform Pack responsibility | SAP-specific leakage into the Kernel? |
|---|---|---|---|
| Login | Authentication (OIDC federation, Zero Trust) | None | None. |
| Discovery Workshop / idea submission | `RequirementDocument` creation, workspace scoping | None | None — the screen's copy, fields, and examples are generic business language (the retail/warehouse example used throughout this review's wireframes is illustrative, not SAP terminology). |
| Clarification Q&A | `Clarification` display/answer, re-structuring trigger | The `requirements-analyst` agent's *retrieval* from `knowledge/sap-domain/*` (see [ADR-0023](../../adr/0023-platform-kernel-and-platform-pack-architecture.md)) may surface SAP-flavored phrasing in a generated clarification question, if the idea text itself touches SAP terminology the user introduced. | **None structural** — any SAP terminology that appears would come from the *user's own input* or the pack's knowledge retrieval, never from the screen's own fixed copy, labels, or logic. The screen itself has zero SAP-aware code. |
| Project Charter / Review & Approve | `Requirement`/`AcceptanceCriterion` display, approval gating, `Project` creation | None | None — `Requirement.kind` (business/functional/non-functional) is generic classification, not SAP taxonomy. |
| Project Ready | `Project` confirmation display | None | None. |

## Confirmed: no screen accidentally introduces SAP-specific responsibility into the Kernel

Every Sprint 1 screen's own fixed logic, labels, and data model is fully Kernel-scoped — this matches [19-platform-kernel-and-platform-packs.md](../../architecture/19-platform-kernel-and-platform-packs.md)'s finding that the Requirements Intake context (Discovery Workshop's home) was already "the cleanest concept in the kernel." The only place SAP-specific content *could* surface in Sprint 1's user-visible experience is through the `requirements-analyst` agent's own knowledge retrieval — and that's the Platform Pack doing exactly its designed job (contributing platform-flavored knowledge to a generic agent), not the Kernel absorbing SAP-specific logic. This is the correct shape, not a smallest-correction target.

## Why the user experience is right to expose no SAP concepts yet, and why that will change correctly later

Per the review's own framing: "the user experience should naturally expose SAP concepts because Sprint 1 targets SAP" — true, but only once the platform actually generates something SAP-specific. Sprint 1 is entirely pre-generation (Discovery only); there is no Fiori screen, no CDS entity, no OData service anywhere in this sprint's scope, so there is nothing SAP-specific *for the UI to honestly show yet*. This will change correctly starting Sprint 3 (Local Application Factory), where SAP-specific artifacts (a generated Fiori Elements app, a CAP service) will legitimately need SAP terminology in the UI — and per the Kernel/Pack boundary, that terminology should appear in **Platform Pack-owned screens or screen sections**, not bleed into Kernel-owned screens like Discovery or Approval.

## No smallest correction needed for Sprint 1

Unlike the earlier Kernel Review ([19-platform-kernel-and-platform-packs.md](../../architecture/19-platform-kernel-and-platform-packs.md)), which found three real, small gaps in shared *code* (`PortCategory`'s enum literal, the flat plugin namespace, the `sap-domain` knowledge path), this screen-level validation finds **zero** gaps — Sprint 1's UI design was already built clean, with no retrofitting required. This is worth stating plainly: not every review needs to find a defect to be a real review.

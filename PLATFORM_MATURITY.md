# Platform Maturity

Tracks the evolution of SAP App Factory across sprints. **Legend:** 🟢 Implemented · 🟡 Planned (a real backlog item and trigger condition exist) · ⚪ Not Started (no backlog item yet) · 🔒 Deferred (deliberately postponed past a stated trigger condition).

This matrix reflects only what's actually decided in the backlog and ADRs as of this baseline — no sprint assignment below implies a new commitment being made by this document. Where no real plan exists yet, that's stated plainly as "Not Started," not filled in with an invented date.

| Capability | Sprint 0 | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 | Sprint 5 | Future |
|---|---|---|---|---|---|---|---|
| Workflow Engine | 🟢 In-memory skeleton, contract-tested | 🟡 Temporal spike (SAF-24) | 🟡 Build-vs-adopt decision, real durable adapter | 🟡 Hardening on real decision | ⚪ | ⚪ | Full durable, multi-tenant workflow execution |
| Capability Registry | 🟢 Registry + one real registration | 🟡 Real `CapabilityResolverPort` adapter, once a 2nd provider type is needed | ⚪ | ⚪ | ⚪ | ⚪ | Full agent/human/external-service marketplace |
| Plugin SDK | 🟢 `execute()` seam, one real plugin | 🔒 Process/container isolation (SAF-25) — before real plugin logic ships | 🟡 Execution profiles / `generated-app-kit` (SAF-31) | ⚪ | ⚪ | ⚪ | Third-party plugin ecosystem |
| LLM Gateway | 🟢 Port + one adapter, mocked responses | ⚪ Real provider traffic — no backlog item yet | ⚪ | ⚪ | ⚪ | ⚪ | Multi-provider fallback, cost governance (R4) |
| MCP Framework | 🟢 Port + stdio adapter, mocked | ⚪ Real MCP server traffic — no backlog item yet | 🟡 `knowledge-retrieval` MCP server (SAF-33) | ⚪ | ⚪ | ⚪ | Full MCP ecosystem integration |
| Project Digital Twin | ⚪ Design only (ADR-0021), zero implementation | ⚪ | 🟡 Implementation (SAF-34–37), once Governance/Project aggregates exist to project from | ⚪ | ⚪ | ⚪ | Full graph-based impact analysis |
| FS (Functional Spec) Generation | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | Planned — no backlog item yet |
| TS (Technical Spec) Generation | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | Planned — no backlog item yet |
| Architecture Generation | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | Planned — no backlog item yet |
| CAP Generation | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | Planned — depends on `generated-app-kit` (SAF-31) existing first |
| UI5 Generation | ⚪ Placeholder plugin only — `fiori-generator` produces one fixed, non-functional artifact, no real UI5 output | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | Planned — real generation logic, depends on `generated-app-kit` |
| SAP GUI Generation | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | Not currently in the platform's stated product vision ([00-vision-and-principles.md](docs/architecture/00-vision-and-principles.md) names Fiori/SAPUI5/CAP/RAP/ABAP, not classic SAP GUI) — included here as requested, pending an actual product decision |
| Testing (generated-app test generation) | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | Planned — no backlog item yet |
| Demo Generation | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | Planned — no backlog item yet |
| User Manual Generation | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | Planned — no backlog item yet |
| Deployment (platform's own pipeline) | ⚪ `deploy-dev` is a stated placeholder | 🟡 Real dev target, once push is authorized and a target chosen | 🟡 Staging (tag-triggered) | 🟡 Prod (manual approval gate) | ⚪ | ⚪ | Build-once-deploy-many, signed images |
| SAP Connectivity | ⚪ | ⚪ | 🟡 One of the seven `generated-app-kit` ports (SAF-31) | ⚪ | ⚪ | ⚪ | Real SAP BTP/on-prem connectivity adapters |
| BTP Deployment | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | ⚪ | Depends on a real BTP entitlement/customer commitment — no date to project |
| Security | 🟢 OIDC, OPA, RLS, redaction, dependency scanning | 🟡 `drizzle-orm` CVE fix, `SecretsVaultPort` adapter | 🟡 SAST/CodeQL licensing decision, envelope encryption (SAF-29) | ⚪ | ⚪ | ⚪ | Continuous hardening, no fixed end state |
| Observability | 🟢 Tracing, structured logging, verified cross-process correlation | ⚪ Metrics/dashboards — no backlog item yet beyond read-models (SAF-28) | 🟡 Read-models enable first real dashboard | ⚪ | ⚪ | ⚪ | Full APM/alerting |
| DevOps | 🟢 CI pipeline defined, locally verified | 🟡 First real GitHub Actions run, real dev deploy target | 🟡 Staging/prod pipeline, signed images | ⚪ | ⚪ | ⚪ | Full build-once-deploy-many across environments |
| Governance | 🟢 ADR process, backlog discipline, Sprint 0 exit gate | 🟡 SAF-22 stakeholder ADR walkthrough confirmation | 🟡 Lighter-weight periodic exit-gate-style review (Lessons Learned recommendation) | ⚪ | ⚪ | ⚪ | Continuous governance cadence, no fixed end state |

## Narrative: platform evolution strategy

**Sprint 0 built the seams, not the product.** Every row scored 🟢 in Sprint 0 is a *mechanism* — a port, a contract test, one real adapter, one real plugin proving the pattern — never a business capability a customer would recognize. This is deliberate: [00-vision-and-principles.md](docs/architecture/00-vision-and-principles.md)'s explicit Sprint 0 non-goals rule out real SAP generation logic entirely, and this maturity matrix should not be read as "behind schedule" on FS/TS/CAP/UI5/Demo/User-Manual generation — those rows are honestly ⚪ because no story has ever targeted them, not because Sprint 0 failed to deliver something promised.

**The generation-capability rows (FS, TS, Architecture, CAP, UI5, SAP GUI, Testing, Demo, User Manual) share one real dependency:** `generated-app-kit` (SAF-31, ADR-0019) — the seven ports (persistence, authentication, authorization, messaging, storage, SAP connectivity, external API) every application-generating plugin will need, plus the shared contract-test suite proving mock/Enterprise-adapter parity. Building any of these generation capabilities before `generated-app-kit` exists would mean each one reinventing its own mock persistence/auth/SAP-API adapters — exactly the duplication risk R20 in the risk register names. **The correct sequencing is `generated-app-kit` first, then the first real generation plugin (most likely CAP or UI5, given the platform's stated `fiori-generator` starting point) as a proof of the whole chain, before the remaining generation capabilities follow the same now-proven pattern.**

**The platform-infrastructure rows (Workflow Engine, Capability Registry, Plugin SDK, LLM Gateway, MCP Framework, Security, Observability, DevOps, Governance) evolve continuously, not toward a fixed "done."** Each already has a real Sprint 0 foundation and a named next increment — none is "finished" even at Future, because durability, security hardening, and governance cadence are permanent platform properties, not features with an end date.

**Project Digital Twin is the one row that's fully designed but entirely unbuilt**, and deliberately so: it depends on Governance/Project aggregate additions (`Risk`/`Incident`/`Problem`/`Change`, `Deployment`/`ApplicationVersion` — SAF-36) that don't exist yet to project from. Building the graph layer before there's anything real to populate it with would be exactly the kind of premature infrastructure this platform's own discipline (see [Lessons Learned](docs/governance/sprint-0-exit-gate/08-lessons-learned.md)) has consistently avoided.

**No row in this matrix should be treated as a commitment beyond what its cited backlog item (SAF-NN) already states.** Where a cell says "no backlog item yet," that is the accurate current state — filling it in with an invented sprint number would misrepresent unplanned work as planned, which this document exists specifically not to do.

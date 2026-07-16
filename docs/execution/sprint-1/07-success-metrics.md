# Sprint 1 Success Metrics

**Revised 2026-07-17** — synchronized with the approved Product Design Review. Digital Twin Coverage reverts to the interim-traceability metric (it was briefly redefined as a "real" metric during the since-reverted Digital Twin pull-forward). Metrics are honest counts and pass/fail checks against this sprint's own real, PDR-approved scope.

| Metric | Definition | Sprint 1 target |
|---|---|---|
| **Completed Vertical Slices** | Count of VS-1 meeting its full Definition of Done ([02-vertical-slice-catalog.md](02-vertical-slice-catalog.md)). | 1 of 1. |
| **Capability Coverage** | Count of capabilities introduced that are registered *and* resolved through a real `CapabilityResolverPort` adapter. | 1 of 1 (`structure-business-requirement`). |
| **Digital Twin Coverage** | Not measurable this sprint — `context-digital-twin` doesn't exist until Sprint 7, per the Product Design Review's own position. Tracked instead as **Interim Traceability Coverage**: the proportion of this sprint's generated artifacts (`RequirementDocument`, `Requirement`, `Clarification`, `AcceptanceCriterion`, `Project`) that are real, persisted, ID-referenceable rows with a recorded `AgentInvocation` where applicable. | 100% (5 of 5 artifact types) — the honest, currently-available substitute metric. |
| **Automated Test Coverage** | Every one of the 19 tasks in [02-vertical-slice-catalog.md](02-vertical-slice-catalog.md) has its test layer(s) from [05-test-strategy.md](05-test-strategy.md) passing in CI, plus the one required end-to-end demo. | 19 of 19 tasks with a passing, owned test layer; 1 of 1 end-to-end demo passing unattended. |
| **Documentation Coverage** | Every new/changed package has a current README; every architecture doc a change makes inaccurate is updated in the same PR. | 2 new package READMEs (`persistence-postgres/requirements`, `persistence-postgres/project`); [02-domain-model.md](../../architecture/02-domain-model.md) updated. |
| **Telemetry Coverage** | Every task with a Telemetry requirement has real OTel spans/structured logs, verified against a live collector. | Idea submission, each structuring invocation, each clarification answer, confirmation attempts, Project creation, event emission — all traced. |
| **Workflow Coverage** | The Discovery `WorkflowDefinition` exercises every "happy path" `WorkflowRunStatus` at least once in the real demo; `failed`/`cancelled` covered by automated tests. | 4 of 4 happy-path statuses in the demo; `failed`/`cancelled` covered by Task 1.16's tests. |
| **Business Value Delivered** | Pass/fail check against the Sprint 1 mission: *"a user transforms a business idea into an approved software project through an AI-guided discovery experience."* | Pass — the single demonstration ([06-demonstration-plan.md](06-demonstration-plan.md)) proves the full mission statement end to end. |
| **Technical Debt Introduced** | Every new item logged, classified by severity, given a resolution timeline, per [TECHNICAL_DEBT_POLICY.md](../../../TECHNICAL_DEBT_POLICY.md). | Recorded honestly at the Sprint Exit Gate; anticipated candidate: any env-gated real-provider test skip pattern (Risk #12, [04-risk-register.md](04-risk-register.md)), carried forward the same way SAF-11's real-Postgres gating was. |
| **Technical Debt Removed** | Count of previously-accepted debt items closed this sprint. | 2 — `drizzle-orm` CVE (Task 1.2) and CI never run on a real runner (Task 1.19). |
| **Sprint Goal Completion** | Binary — did Sprint 1 achieve its stated exit criteria? | Pass/fail, assessed at the Sprint 1 Exit Gate against the mission statement directly. |

## Note on this revision

The 2026-07-16 revision briefly redefined Digital Twin Coverage as a "real" metric on the strength of a Digital Twin pull-forward that this correction reverts. Restoring the interim-traceability definition here isn't a downgrade — it's aligning the metric with what Sprint 1 actually, correctly builds, per the Product Design Review.

# @sap-app-factory/context-governance

## Purpose
Governance & Audit bounded context — ITIL/PMO alignment made structural rather than aspirational. See [02-domain-model.md](../../docs/architecture/02-domain-model.md).

## Contents (Sprint 0 scope)
`src/domain/risk.ts` — the `Risk` aggregate, added per [ADR-0021](../../docs/adr/0021-project-digital-twin-knowledge-graph.md) as the concrete realization of the ITIL-alignment principle stated since Sprint 0. `AuditEvent`, `PolicyRule`, `ApprovalGate`, `ComplianceRecord`, `Incident`, `Problem`, `Change` arrive with their owning feature work.

## Ports
None yet — `src/application/` (which will depend on `PolicyEnginePort`) is added once a real use case needs one.

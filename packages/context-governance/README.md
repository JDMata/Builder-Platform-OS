# @sap-app-factory/context-governance

## Purpose
Governance & Audit bounded context — ITIL/PMO alignment made structural rather than aspirational. See [02-domain-model.md](../../docs/architecture/02-domain-model.md).

## Contents (Sprint 0 scope)
- `src/domain/risk.ts` — the `Risk` aggregate, added per [ADR-0021](../../docs/adr/0021-project-digital-twin-knowledge-graph.md) as the concrete realization of the ITIL-alignment principle stated since Sprint 0.
- `src/domain/audit-event.ts` — the `AuditEvent` aggregate (SAF-14): append-only by design, no update/mutate function. The fastest-growing table at target scale (ADR-0009 revision, ADR-0017) — the one this context's monthly-partitioned-table migration (`persistence-postgres/governance`) exists to prove.

`PolicyRule`, `ApprovalGate`, `ComplianceRecord`, `Incident`, `Problem`, `Change` arrive with their owning feature work.

## Ports
None yet — `src/application/` (which will depend on `PolicyEnginePort`) is added once a real use case needs one.

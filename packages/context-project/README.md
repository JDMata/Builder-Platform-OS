# @sap-app-factory/context-project

## Purpose
Project & Workspace bounded context — the unit a delivery team works in, plus the Connection Management capability. See [02-domain-model.md](../../docs/architecture/02-domain-model.md).

## Contents (Sprint 0 scope)
- `src/domain/workspace.ts` — the `Workspace` aggregate.
- `src/domain/target-system-connection.ts` — `TargetSystemConnection`, per [ADR-0015](../../docs/adr/0015-target-system-credential-management.md): carries only an opaque, envelope-encrypted reference, never plaintext credential material — structurally, not just by convention.

`Project`, `RepositoryBinding`, `Environment`, `Deployment`, `ApplicationVersion` arrive with their owning feature work.

## Ports
None yet — `src/application/` is added once a real use case needs `@sap-app-factory/ports`.

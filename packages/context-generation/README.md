# @sap-app-factory/context-generation

## Purpose
Generation / Artifact bounded context — what actually gets produced. See [02-domain-model.md](../../docs/architecture/02-domain-model.md).

## Contents (Sprint 0 scope)
`src/domain/artifact.ts` — the `Artifact` aggregate, with a deliberately opaque `artifactType` string (the core never interprets it — see [ADR-0006](../../docs/adr/0006-plugin-architecture.md)) and its draft → review → approved/archived lifecycle. `ArtifactVersion`, `GenerationJob`, `ReviewGate` arrive with their owning feature work.

## Ports
None yet — `src/application/` (which will depend on `ObjectStorePort`) is added once a real use case needs one.

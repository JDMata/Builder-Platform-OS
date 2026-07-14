# @sap-app-factory/context-digital-twin

## Purpose
Digital Twin / Traceability bounded context — owns the graph structure representing every artifact a project produces, never the artifact content itself. See [16-project-digital-twin.md](../../docs/architecture/16-project-digital-twin.md) and [ADR-0021](../../docs/adr/0021-project-digital-twin-knowledge-graph.md).

## Contents (Sprint 0 scope)
`src/domain/digital-twin-node.ts` — the `DigitalTwinNode` aggregate: opaque `nodeType`, a `sourceRef` pointing at the real data elsewhere, never retired via hard delete. `DigitalTwinEdge`, `NodeTypeDefinition`, `RelationshipTypeDefinition`, `DigitalTwinSnapshot` arrive with their owning feature work.

## Ports
None yet — `src/application/` (which will depend on `GraphStorePort`/`SearchIndexPort`) is added once a real use case needs one.

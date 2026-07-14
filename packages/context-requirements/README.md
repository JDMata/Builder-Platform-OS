# @sap-app-factory/context-requirements

## Purpose
Requirements Intake bounded context — captures and structures business requirements before generation starts. See [02-domain-model.md](../../docs/architecture/02-domain-model.md).

## Contents (Sprint 0 scope)
`src/domain/requirement.ts` — the `Requirement` aggregate, with `kind` (`business | functional | non-functional | user-story`) added per [ADR-0021](../../docs/adr/0021-project-digital-twin-knowledge-graph.md): a User Story is a shape of `Requirement`, not a separate aggregate. `RequirementDocument`, `Clarification`, `AcceptanceCriterion` arrive with their owning feature work.

## Ports
None yet — `src/application/` is added once a real use case needs one.

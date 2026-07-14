# @sap-app-factory/context-identity

## Purpose
Identity & Access bounded context — authorization data (who can do what, where). Authentication itself is downstream of an external IdP; see [08-authentication-and-rbac.md](../../docs/architecture/08-authentication-and-rbac.md).

## Contents (Sprint 0 scope)
`src/domain/tenant.ts` — the `Tenant` aggregate, illustrating the "no hard delete, archive instead" rule (aggregate design rule 5). Full aggregate set (`User`, `Role`, `Permission`, `Session`) arrives with its owning feature work — see [02-domain-model.md](../../docs/architecture/02-domain-model.md).

## Ports
None yet — `src/application/` (which will depend on `@sap-app-factory/ports`) is added once a real use case needs one.

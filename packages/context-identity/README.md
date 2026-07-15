# @sap-app-factory/context-identity

## Purpose
Identity & Access bounded context — authorization data (who can do what, where). Authentication itself is downstream of an external IdP; see [08-authentication-and-rbac.md](../../docs/architecture/08-authentication-and-rbac.md).

## Contents (Sprint 0 scope)
- `src/domain/tenant.ts` — the `Tenant` aggregate, illustrating the "no hard delete, archive instead" rule (aggregate design rule 5).
- `src/domain/permission.ts` — `Permission` (`{ id, resource, action }`), `definePermission()`, `permissionKey()` (`"resource:action"`, matching the shape `PolicyEnginePort`'s adapters evaluate against — see [08-authentication-and-rbac.md](../../docs/architecture/08-authentication-and-rbac.md)).
- `src/domain/role.ts` — `Role` (`{ id, name, permissionIds, status: "active" | "retired" }`), `defineRole()`, `retireRole()` — same archive-not-delete rule as `Tenant`.

`User`/`Session` aggregates still arrive with their owning feature work.

## Ports
None yet — `src/application/` (which will depend on `@sap-app-factory/ports`) is added once a real use case needs one.

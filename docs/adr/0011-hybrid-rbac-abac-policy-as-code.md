# 0011 — Hybrid RBAC + ABAC via policy-as-code
Status: Proposed
Date: 2026-07-14

## Context
Coarse roles (Developer, Reviewer, Admin) are necessary but not sufficient: authorization decisions in an SAP delivery context often depend on attributes — target environment (dev vs. prod), data classification, plugin risk tier, separation-of-duties rules for PMO/ITIL compliance. Scattering `if (user.role === ...)` conditionals through application code makes these rules impossible to audit or test as a unit.

## Decision
Roles grant coarse-grained permission bundles (`resource:action` at tenant/workspace/project scope). `PolicyRule`s add attribute-based conditions on top, evaluated by an externalized policy engine behind `ports/policy-engine.port.ts` (OPA/Rego or Cedar adapter). `api-gateway` performs coarse checks at the edge; `application/*` use cases perform fine-grained, resource-scoped checks through the same port. Policy bundles are versioned and unit-tested. See [08-authentication-and-rbac.md](../architecture/08-authentication-and-rbac.md).

## Consequences
- Every authorization decision is traceable to a specific policy bundle version — the concrete mechanism behind the PMO/ITIL-alignment principle, not just a claim.
- Adding a new attribute-based rule (e.g., "prod deploys require two distinct approvers") is a policy change, reviewable and testable like code, not an application-code change requiring redeploy of business logic.
- Introduces a dependency on the team building policy-as-code fluency (Rego or Cedar) — flagged as risk R6 in [12-risks-and-technical-debt.md](../architecture/12-risks-and-technical-debt.md).

## Alternatives considered
- **Pure RBAC, no attribute layer**: rejected — cannot express environment- or classification-dependent rules without role explosion (a role per environment × per data-classification combination), which becomes unmanageable quickly.
- **Authorization logic embedded in application code (`if` statements per use case)**: rejected — not auditable as a unit, not independently testable, and exactly the pattern that makes compliance reviews expensive and error-prone.
- **Full custom policy DSL built in-house**: rejected — reinvents a well-solved problem; OPA/Cedar are proven, and the port abstraction means either can be adopted without lock-in to one policy language.

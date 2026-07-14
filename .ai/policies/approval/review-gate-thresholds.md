---
id: review-gate-thresholds
kind: approval
version: 1
status: draft
---

# Policy: Review gate thresholds

## Condition
A `capability-request` step (fulfilled by any provider — plugin, agent, or future human/external service, see [ADR-0022](../../docs/adr/0022-capability-model-provider-abstraction.md)) has produced an `Artifact` intended for promotion beyond a developer's own Local POC execution profile (see [ADR-0019](../../docs/adr/0019-execution-profiles-for-generated-applications.md)) — i.e., promotion to a shared Hybrid or Enterprise environment.

## Action
Create a `ReviewGate` on the `Artifact`. Requires role `Reviewer` or `DeliveryLead` (see [SECURITY_BASELINE.md](../../SECURITY_BASELINE.md) RBAC baseline). If the target `Environment.kind == 'prod'`, separation of duties applies: the approver must not be the same actor who triggered the generation run.

## Applies to
Illustrative — intended for any future application-generating plugin's workflow (e.g., `cap-node-generator`, `fiori-generator`), referenced from the relevant `workflow.md`'s `human-approval` step.

## Rationale
Generated code reaching a real customer-facing or production environment without a second set of eyes is exactly the kind of ungated change [TECHNICAL_DEBT_POLICY.md](../../TECHNICAL_DEBT_POLICY.md) and ITIL alignment ([00-vision-and-principles.md](../../docs/architecture/00-vision-and-principles.md)) require a change record and approval for — this policy is that requirement, expressed as data.

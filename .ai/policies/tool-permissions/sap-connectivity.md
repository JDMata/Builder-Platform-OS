---
id: sap-connectivity
kind: tool-permission
version: 1
status: draft
---

# Policy: SAP Connectivity tool scope

## Condition
Any agent whose `agent.md` lists an MCP tool bound to a customer's real SAP backend system (SAP Connectivity, per [14-execution-profiles.md](../../docs/architecture/14-execution-profiles.md)) — illustrative for a not-yet-built agent such as `integration-specialist`.

## Action
Every call requires per-call approval, regardless of read vs. write — this is a materially higher-risk tool category than `knowledge-retrieval`, since it reaches a live customer system. Write operations additionally require the `connection:use` permission ([SECURITY_BASELINE.md](../../SECURITY_BASELINE.md)) and are logged as `AuditEvent`s tying the call back to the specific `WorkflowRun` and `TargetSystemConnection` used ([ADR-0015](../../docs/adr/0015-target-system-credential-management.md)).

## Applies to
Illustrative — any future agent granted an SAP Connectivity tool binding.

## Rationale
This mirrors the Zero Trust tool-call rule already established for plugins ([08-authentication-and-rbac.md](../../docs/architecture/08-authentication-and-rbac.md)): any tool call that touches a target system or a credential requires approval regardless of what the calling agent's manifest technically permits — a compromised or manipulated agent must not be able to reach a customer's real SAP backend unsupervised.

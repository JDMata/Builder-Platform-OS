# 0015 — Target-system credential management
Status: Proposed
Date: 2026-07-14 (added in principal-architect review, see [13-principal-architect-self-review.md](../architecture/13-principal-architect-self-review.md) §2.2)

## Context
The platform must hold credentials to deploy generated artifacts into a customer's SAP BTP/Cloud Foundry/Kyma/on-prem landscape. Sprint 0's `ports/secrets-vault.port.ts` was scoped for the platform's own operational secrets (IdP client secret, LLM/MCP provider keys) and was at risk of being silently reused for this much higher-stakes case without a distinct threat model — a compromise here is privileged access into a customer's production ERP-adjacent systems, not just the platform's own infrastructure.

## Decision
Introduce a first-class Connection Management capability (part of the Project/Workspace context) modeling `TargetSystemConnection` as its own aggregate — distinct from generic secrets. Credential material is envelope-encrypted: a per-tenant data-encryption key (DEK) encrypts the credential, and the DEK itself is wrapped by a key-encryption key (KEK) held in a managed KMS/HSM. Dedicated-tier tenants ([ADR-0013](0013-tenancy-isolation-tiering.md)) may supply their own KEK (BYOK), so the platform never has ambient ability to decrypt their target-system credentials. Credentials are fetched just-in-time for a single deployment operation and never cached in `worker` memory beyond that operation's lifetime. Every use is recorded as an `AuditEvent` (actor, workflow run, target, purpose). RBAC gains a `connection:use` permission distinct from `connection:manage`, enabling separation of duties for higher-assurance tenants (the person who configures a connection need not be the one authorized to trigger a deployment using it).

## Consequences
- A credential-handling security review has a concrete, bounded surface (the Connection Management capability) instead of "wherever secrets-vault happens to be called."
- BYOK is a real, deliverable enterprise commitment, not an aspiration — it's structurally supported by the DEK/KEK split from the start.
- Adds implementation cost: envelope encryption and short-lived credential issuance are more work than "store a secret, fetch it when needed" — accepted deliberately given the stakes.
- `ports/secrets-vault.port.ts` remains for the platform's own operational secrets; `TargetSystemConnection` is explicitly not just another entry in it, to keep the two threat models (platform secrets vs. customer-system credentials) visibly separate in code and in review.

## Related decision (2026-07-14)
[ADR-0019](0019-execution-profiles-for-generated-applications.md) reuses `TargetSystemConnection` as the resolution target for a generated application's Enterprise-tier SAP Connectivity port bindings, rather than introducing a second credential store for that purpose — see that ADR's alternatives for why a second mechanism was explicitly rejected.

## Alternatives considered
- **Reuse the generic secrets-vault port for target-system credentials too**: rejected — collapses two different threat models (platform's own ops secrets vs. privileged access to customer production systems) into one undifferentiated bucket, making it easy to under-invest in the controls the higher-stakes case actually needs.
- **Store target-system credentials only at rest, decrypted into `worker` memory for the process lifetime**: rejected — unnecessarily widens the exposure window; just-in-time fetch scoped to a single operation is not materially harder to implement and meaningfully reduces blast radius.
- **Defer BYOK indefinitely ("add it if a customer asks")**: rejected — retrofitting a KEK/DEK split onto already-encrypted-with-platform-key data is a customer-visible migration; designing for it now costs little and avoids that migration entirely.

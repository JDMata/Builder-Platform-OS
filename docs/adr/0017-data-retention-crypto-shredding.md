# 0017 — Data retention, partitioned archival, and crypto-shredding for erasure
Status: Accepted
Date: 2026-07-14 (added in principal-architect review, see [13-principal-architect-self-review.md](../architecture/13-principal-architect-self-review.md) §2.5, §6.4)

## Context
Two problems, related by the same tables: (1) `audit_event`, `agent_invocation`, and `workflow_step` are the fastest-growing tables in the system — a conservative estimate (500 projects × ~50 runs/project/year × 20 steps × 2 invocations) is on the order of 1M+ rows/year in `agent_invocation` alone, tens of millions within the platform's own 10-year horizon, with no partitioning or archival plan in the original design. (2) `AuditEvent` is deliberately append-only for ITIL/PMO integrity ([02-domain-model.md](../architecture/02-domain-model.md)), which structurally conflicts with GDPR/CCPA erasure requests once real PII (in requirement text, user identifiers, generated artifacts) is stored inside it.

## Decision
**Retention & partitioning:** `audit_event`, `agent_invocation`, and `workflow_step` are created as monthly range-partitioned tables from their first migration (partitioned on `created_at`), each bounded context's schema defining its own retention window per data class (e.g., audit events: multi-year regulatory retention; raw LLM prompt/response logs: 30–90 days, the highest sensitivity-to-value ratio in the system). Aging out data is a partition drop (cheap, instant) rather than a row-by-row `DELETE` against a live, indexed table. Data past its hot-tier window is archived to MinIO/object storage before the partition is dropped, not simply discarded, to preserve compliance-relevant history at lower cost and lower query availability.

**Erasure vs. append-only integrity:** PII is never stored inline in `audit_event` or other append-only records. It lives in a separate per-subject-keyed `pii_vault`, encrypted with a key unique to that data subject; audit/event records reference the subject by opaque ID and reconstruct human-readable content only by joining through the vault at read time, behind access control. Fulfilling an erasure request destroys the subject's vault key (crypto-shredding) — the audit trail's row structure, counts, and non-PII fields remain intact (preserving ITIL/PMO auditability), but the PII content becomes permanently unrecoverable.

## Consequences
- Archival/retention is designed in before the first production row is written, avoiding a much harder "add partitioning to a live multi-billion-row table" migration later.
- Erasure requests become a fast, well-defined operation (delete one key) instead of an ad-hoc, risky edit of compliance-critical tables.
- Adds a small amount of upfront complexity: any code path that renders human-readable audit/event content must resolve through the PII vault, and vault key management itself becomes a new operational responsibility (rotation, backup, access control on the vault's own KMS-backed master key).
- Retention windows differ by data class and must be encoded as explicit, reviewed policy (not left to "whatever the default partition count happens to be") — tracked as a governance/compliance configuration artifact, not a hardcoded constant.

## Alternatives considered
- **Unbounded retention, no partitioning ("storage is cheap")**: rejected — storage cost is the minor issue; the real cost is query/index/vacuum degradation on ever-growing tables and the eventual forced emergency migration under production load, which is far more expensive than designing partitioning in from the start.
- **Anonymize PII in place on erasure request (in-place `UPDATE`)**: rejected — mutating rows in an append-only audit table undermines the integrity property that makes it useful for compliance in the first place (an auditor can no longer trust that no row was ever altered); crypto-shredding achieves erasure without ever mutating the row.
- **Keep PII inline and rely on manual, ticket-driven erasure processes**: rejected — doesn't scale past a handful of requests and is exactly the kind of process that fails an audit the first time it's tested at real volume.

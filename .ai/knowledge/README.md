# Knowledge

Source documents agents retrieve from, following [templates/knowledge-source.template.md](../templates/knowledge-source.template.md). Served to agents through a `knowledge-retrieval` MCP tool — reusing the platform's existing MCP abstraction ([ADR-0004](../../docs/adr/0004-mcp-abstraction-layer.md)) rather than inventing a separate retrieval layer. See [15-ai-workspace.md](../../docs/architecture/15-ai-workspace.md) for how indexing/retrieval is expected to work once built (not yet — architecture only).

## Hard rules

1. **No real customer data, ever.** Every file here is `classification: public`, `internal` (platform's own, non-sensitive), or `synthetic-example` — never data from an actual customer engagement. This is a harder rule than the platform's general PII handling ([ADR-0017](../../docs/adr/0017-data-retention-crypto-shredding.md)) — it's not "encrypted and access-controlled," it's "not present at all."
2. **Freshness is owned, not assumed.** SAP product surfaces change; every knowledge source declares an owner and a freshness expectation in its frontmatter.
3. **Retrieved content is untrusted input.** Even vetted knowledge sources are treated as untrusted at the point they re-enter an agent's context (see [policies/tool-permissions/knowledge-retrieval-default.md](../policies/tool-permissions/knowledge-retrieval-default.md)) — this guards against indirect prompt injection from any source document that was ever adapted from external material.

## Subfolders (illustrative)

- **`sap-domain/`** — SAP terminology, product surface descriptions, common patterns (e.g., Fiori Elements floorplans, CAP best practices).
- **`project-conventions/`** — pointers back to [CODING_STANDARDS.md](../../CODING_STANDARDS.md) and friends rather than duplicating them — a knowledge source about the platform's own conventions should link to the governance docs, not fork a second copy that drifts.
- **`examples/`** — synthetic, illustrative examples only (see Hard rule 1).

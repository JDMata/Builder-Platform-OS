---
id: knowledge-retrieval-default
kind: tool-permission
version: 1
status: draft
---

# Policy: `knowledge-retrieval` default scope

## Condition
Any agent whose `agent.md` lists `knowledge-retrieval` under Allowed MCP tools, with no more restrictive policy referenced instead.

## Action
Grant read-only access, no per-call approval required, rate-limited to the platform default per-agent budget (see [ports/rate-limiter.port.ts](../../PROJECT_STRUCTURE.md)). Retrieved content is treated as untrusted input at the point it re-enters the agent's context — narrowed and validated like any external input, per [CODING_STANDARDS.md](../../CODING_STANDARDS.md), specifically to guard against indirect prompt injection via `knowledge/` content that was adapted from external sources.

## Applies to
Default for any agent using `knowledge-retrieval` without a more specific override — e.g. `agents/requirements-analyst`.

## Rationale
Read-only retrieval of vetted, non-customer knowledge content is low-risk and shouldn't require per-call human approval — that would make retrieval-augmented context loading unusable in practice. The rate limit exists to bound cost, not because retrieval itself is dangerous; the untrusted-input treatment exists because knowledge content, even vetted, can still carry injected instructions if a source document was ever adapted from something external.

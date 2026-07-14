# @sap-app-factory/context-mcp-registry

## Purpose
MCP Registry bounded context — provider-agnostic tool access, the Zero Trust control point for tool calls. See [ADR-0004](../../docs/adr/0004-mcp-abstraction-layer.md).

## Contents (Sprint 0 scope)
`src/domain/mcp-server-registration.ts` — the `McpServerRegistration` aggregate. `McpTool`, `CapabilityBinding` arrive with their owning feature work.

## Ports
None yet — `src/application/` (which will depend on `McpConnectionPort`) is added once a real use case needs one.

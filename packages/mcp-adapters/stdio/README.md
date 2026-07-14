# @sap-app-factory/adapter-mcp-stdio

## Purpose
Implements `McpConnectionPort` over the stdio MCP transport. See [ADR-0004](../../../docs/adr/0004-mcp-abstraction-layer.md).

## Ports
Implements `McpConnectionPort` (`@sap-app-factory/ports`).

## Sprint 0 scope
Returns a fixed, typed mocked tool list and invocation result — no real subprocess spawned. Proven against `testing-kit`'s `mcpConnectionContractTests` harness.

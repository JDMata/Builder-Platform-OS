import { describe, expect, it } from "vitest";
import type { McpConnectionPort } from "@sap-app-factory/ports";
import { createTestRequestContext } from "../request-context.fixture.js";

/** Any adapter behind McpConnectionPort must pass this suite. See ADR-0004. */
export function mcpConnectionContractTests(
  createAdapter: () => McpConnectionPort | Promise<McpConnectionPort>,
): void {
  describe("McpConnectionPort contract", () => {
    it("listTools() returns tool schemas with a name and inputSchema", async () => {
      const adapter = await createAdapter();
      const ctx = createTestRequestContext();

      const tools = await adapter.listTools(ctx, "test-server");

      expect(Array.isArray(tools)).toBe(true);
      for (const tool of tools) {
        expect(tool.name.length).toBeGreaterThan(0);
        expect(typeof tool.inputSchema).toBe("object");
      }
    });

    it("invokeTool() returns a result with an isError flag", async () => {
      const adapter = await createAdapter();
      const ctx = createTestRequestContext();

      const result = await adapter.invokeTool(ctx, {
        serverId: "test-server",
        toolName: "echo",
        arguments: { message: "hi" },
        capabilityTokenId: "test-token",
      });

      expect(typeof result.isError).toBe("boolean");
    });
  });
}

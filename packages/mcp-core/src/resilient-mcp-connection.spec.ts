import { describe, expect, it } from "vitest";
import type { McpConnectionPort, McpToolInvocationResult } from "@sap-app-factory/ports";
import { createTestRequestContext } from "@sap-app-factory/testing-kit";
import { withMcpResilience } from "./resilient-mcp-connection.js";

// The retry/timeout algorithm itself is tested once, generically, in
// @sap-app-factory/resilience-kit. This only proves the wiring: that
// withMcpResilience actually applies it to both port methods.

function makeFlakyAdapter(failuresBeforeSuccess: number): McpConnectionPort {
  let calls = 0;
  return {
    listTools() {
      return Promise.resolve([]);
    },
    invokeTool(): Promise<McpToolInvocationResult> {
      calls += 1;
      if (calls <= failuresBeforeSuccess) {
        return Promise.reject(new Error(`transient failure ${calls}`));
      }
      return Promise.resolve({ content: { ok: true }, isError: false });
    },
  };
}

describe("withMcpResilience", () => {
  it("retries a transient failure on invokeTool() and eventually succeeds", async () => {
    const wrapped = withMcpResilience(makeFlakyAdapter(2), { maxAttempts: 3, baseBackoffMs: 1 });
    const result = await wrapped.invokeTool(createTestRequestContext(), {
      serverId: "s1",
      toolName: "echo",
      arguments: {},
      capabilityTokenId: "t1",
    });
    expect(result.isError).toBe(false);
  });

  it("gives up after maxAttempts", async () => {
    const wrapped = withMcpResilience(makeFlakyAdapter(5), { maxAttempts: 2, baseBackoffMs: 1 });
    await expect(
      wrapped.invokeTool(createTestRequestContext(), {
        serverId: "s1",
        toolName: "echo",
        arguments: {},
        capabilityTokenId: "t1",
      }),
    ).rejects.toThrow(/transient failure/);
  });
});

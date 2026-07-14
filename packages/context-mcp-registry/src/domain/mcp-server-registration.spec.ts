import { describe, expect, it } from "vitest";
import { disableMcpServer, registerMcpServer } from "./mcp-server-registration.js";

describe("McpServerRegistration", () => {
  it("registers active with a transport", () => {
    const registration = registerMcpServer({
      id: "s1",
      name: "knowledge-retrieval",
      transport: "stdio",
    });
    expect(registration.status).toBe("active");
    expect(registration.transport).toBe("stdio");
  });

  it("rejects an empty name", () => {
    expect(() => registerMcpServer({ id: "s1", name: "", transport: "stdio" })).toThrow(
      /must not be empty/,
    );
  });

  it("disables without mutating the original", () => {
    const registration = registerMcpServer({ id: "s1", name: "x", transport: "http-sse" });
    const disabled = disableMcpServer(registration);
    expect(disabled.status).toBe("disabled");
    expect(registration.status).toBe("active");
  });
});

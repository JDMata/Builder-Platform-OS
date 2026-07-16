import { describe, expect, it } from "vitest";
import { registerCapabilityProvider } from "@sap-app-factory/context-capability-registry";
import { createTestRequestContext } from "@sap-app-factory/testing-kit";
import { InMemoryCapabilityResolverAdapter } from "./in-memory-capability-resolver-adapter.js";

describe("InMemoryCapabilityResolverAdapter priority fallback", () => {
  it("resolves to the lowest-priority-number (highest-priority) provider among several registered for the same capability", async () => {
    const primary = registerCapabilityProvider({
      id: "provider-a",
      capabilityId: "structure-business-requirement",
      providerType: "agent",
      providerId: "requirements-analyst",
      providerVersion: 1,
      priority: 1,
    });
    const fallback = registerCapabilityProvider({
      id: "provider-b",
      capabilityId: "structure-business-requirement",
      providerType: "human",
      providerId: "manual-analyst-review",
      providerVersion: 1,
      priority: 2,
    });

    const adapter = new InMemoryCapabilityResolverAdapter([fallback, primary]);
    const resolved = await adapter.resolve(
      createTestRequestContext(),
      "structure-business-requirement",
    );

    expect(resolved.providerId).toBe("requirements-analyst");
  });
});

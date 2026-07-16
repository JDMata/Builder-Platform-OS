import { describe, expect, it } from "vitest";
import type { DomainEventEnvelope, DomainEventHandler, EventBusPort } from "@sap-app-factory/ports";
import { buildDependencies } from "./build-dependencies.js";

class FakeEventBus implements EventBusPort {
  publish(_ctx: unknown, _event: DomainEventEnvelope): Promise<void> {
    return Promise.resolve();
  }
  subscribe(_eventType: string, _handler: DomainEventHandler): void {
    // no-op
  }
}

describe("buildDependencies", () => {
  it("wires every port with a concrete implementation", () => {
    const deps = buildDependencies(new FakeEventBus(), "sk-test-placeholder");

    expect(deps.llmProvider).toBeDefined();
    expect(deps.mcpConnection).toBeDefined();
    expect(deps.eventBus).toBeDefined();
    expect(deps.workflowEngine).toBeDefined();
  });

  it("loads the example plugin and registers its capability", () => {
    const deps = buildDependencies(new FakeEventBus(), "sk-test-placeholder");

    expect(deps.plugins).toHaveLength(1);
    expect(deps.capabilityProviders.length).toBeGreaterThan(0);
    expect(deps.capabilityProviders[0]?.provider.providerId).toBe(deps.plugins[0]?.manifest.id);
  });

  it("uses the same eventBus instance passed in — never constructs its own", () => {
    const eventBus = new FakeEventBus();

    const deps = buildDependencies(eventBus, "sk-test-placeholder");

    expect(deps.eventBus).toBe(eventBus);
  });
});

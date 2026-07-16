import { describe, expect, it } from "vitest";
import type { DomainEventEnvelope, DomainEventHandler, EventBusPort } from "@sap-app-factory/ports";
import type { Pool } from "pg";
import { buildDependencies } from "./build-dependencies.js";

class FakeEventBus implements EventBusPort {
  publish(_ctx: unknown, _event: DomainEventEnvelope): Promise<void> {
    return Promise.resolve();
  }
  subscribe(_eventType: string, _handler: DomainEventHandler): void {
    // no-op
  }
}

/** Never queried in these tests — buildDependencies only passes it to repository constructors, which don't touch the pool until a method is called. */
const fakePool = {} as Pool;

describe("buildDependencies", () => {
  it("wires every port with a concrete implementation", () => {
    const deps = buildDependencies(new FakeEventBus(), "sk-test-placeholder", fakePool);

    expect(deps.llmProvider).toBeDefined();
    expect(deps.mcpConnection).toBeDefined();
    expect(deps.eventBus).toBeDefined();
    expect(deps.workflowEngine).toBeDefined();
    expect(deps.policyEngine).toBeDefined();
    expect(deps.capabilityResolver).toBeDefined();
    expect(deps.requirementDocuments).toBeDefined();
    expect(deps.requirements).toBeDefined();
    expect(deps.clarifications).toBeDefined();
    expect(deps.acceptanceCriteria).toBeDefined();
    expect(deps.projects).toBeDefined();
  });

  it("loads the example plugin and registers its capability", () => {
    const deps = buildDependencies(new FakeEventBus(), "sk-test-placeholder", fakePool);

    expect(deps.plugins).toHaveLength(1);
    expect(deps.capabilityProviders.length).toBeGreaterThan(0);
    expect(deps.capabilityProviders[0]?.provider.providerId).toBe(deps.plugins[0]?.manifest.id);
  });

  it("registers the requirements-analyst agent as a capability provider", () => {
    const deps = buildDependencies(new FakeEventBus(), "sk-test-placeholder", fakePool);

    const agentRegistration = deps.capabilityProviders.find(
      (registration) => registration.provider.providerType === "agent",
    );
    expect(agentRegistration?.provider.providerId).toBe("requirements-analyst");
    expect(agentRegistration?.capability.id).toBe("structure-business-requirement");
  });

  it("uses the same eventBus instance passed in — never constructs its own", () => {
    const eventBus = new FakeEventBus();

    const deps = buildDependencies(eventBus, "sk-test-placeholder", fakePool);

    expect(deps.eventBus).toBe(eventBus);
  });
});

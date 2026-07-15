import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type {
  CapabilityPlugin,
  GeneratedArtifact,
  GenerationInput,
  PluginActivationContext,
  PluginManifest,
  ValidationResult,
} from "@sap-app-factory/plugin-sdk";
import type { DomainEventEnvelope, DomainEventHandler, EventBusPort } from "@sap-app-factory/ports";
import { buildDependencies } from "./build-dependencies.js";
import { createServer } from "./server.js";

function stubPlugin(overrides: Partial<CapabilityPlugin> = {}): CapabilityPlugin {
  const manifest: PluginManifest = {
    id: "stub-plugin",
    version: 1,
    displayName: "Stub",
    producesArtifactTypes: ["stub-artifact"],
    requiredMcpCapabilities: [],
    requiredLlmCapabilities: [],
    requiredPermissions: [],
    supportedExecutionProfiles: ["local-poc"],
    portCategoriesUsed: [],
  };
  return {
    manifest,
    activate: (_ctx: PluginActivationContext) => Promise.resolve(),
    validate: (_input: GenerationInput): ValidationResult => ({ valid: true, errors: [] }),
    generate: (_input: GenerationInput): Promise<readonly GeneratedArtifact[]> =>
      Promise.resolve([]),
    deactivate: () => Promise.resolve(),
    ...overrides,
  };
}

class FakeEventBus implements EventBusPort {
  readonly published: DomainEventEnvelope[] = [];
  publish(_ctx: unknown, event: DomainEventEnvelope): Promise<void> {
    this.published.push(event);
    return Promise.resolve();
  }
  subscribe(_eventType: string, _handler: DomainEventHandler): void {
    // no-op
  }
}

describe("worker server", () => {
  let baseUrl: string;
  let eventBus: FakeEventBus;
  let close: () => Promise<void>;

  beforeEach(async () => {
    eventBus = new FakeEventBus();
    const deps = buildDependencies(eventBus);
    const server = createServer(deps);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
    close = () => new Promise((resolve) => server.close(() => resolve()));
  });

  afterEach(async () => {
    await close();
  });

  it("GET /health reports the loaded plugin", async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = (await response.json()) as { status: string; plugins: string[] };

    expect(response.status).toBe(200);
    expect(body.plugins).toEqual(["fiori-generator"]);
  });

  it("POST /invoke drives a real plugin invocation and returns its artifacts", async () => {
    const response = await fetch(`${baseUrl}/invoke`, { method: "POST" });
    const body = (await response.json()) as { pluginId: string; artifacts: unknown[] };

    expect(response.status).toBe(200);
    expect(body.pluginId).toBe("fiori-generator");
    expect(body.artifacts).toHaveLength(1);
  });

  it("POST /invoke publishes generation.job.started/completed events", async () => {
    await fetch(`${baseUrl}/invoke`, { method: "POST" });

    expect(eventBus.published.map((e) => e.type)).toEqual([
      "generation.job.started.v1",
      "generation.job.completed.v1",
    ]);
  });

  it("returns 404 for an unknown route", async () => {
    const response = await fetch(`${baseUrl}/no-such-route`);

    expect(response.status).toBe(404);
  });

  it("POST /invoke returns 503 when no plugin is loaded", async () => {
    const server = createServer({ eventBus, plugins: [] });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    const url = `http://127.0.0.1:${port}`;

    const response = await fetch(`${url}/invoke`, { method: "POST" });
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(503);
    expect(body.error).toBe("no_plugin_loaded");

    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("POST /invoke returns 500 with the error message when the plugin throws", async () => {
    const plugin = stubPlugin({ generate: () => Promise.reject(new Error("boom")) });
    const server = createServer({ eventBus, plugins: [plugin] });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    const url = `http://127.0.0.1:${port}`;

    const response = await fetch(`${url}/invoke`, { method: "POST" });
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(500);
    expect(body.error).toBe("boom");

    await new Promise<void>((resolve) => server.close(() => resolve()));
  });

  it("POST /invoke returns a generic 500 when a non-Error value is thrown", async () => {
    // Deliberately rejecting with a non-Error value — exercises the server's
    // `error instanceof Error` fallback branch.
    // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
    const plugin = stubPlugin({ generate: () => Promise.reject("not an Error instance") });
    const server = createServer({ eventBus, plugins: [plugin] });
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    const url = `http://127.0.0.1:${port}`;

    const response = await fetch(`${url}/invoke`, { method: "POST" });
    const body = (await response.json()) as { error: string };

    expect(response.status).toBe(500);
    expect(body.error).toBe("unknown_error");

    await new Promise<void>((resolve) => server.close(() => resolve()));
  });
});

import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { DomainEventEnvelope, DomainEventHandler, EventBusPort } from "@sap-app-factory/ports";
import { buildDependencies } from "./build-dependencies.js";
import { createServer } from "./server.js";

class FakeEventBus implements EventBusPort {
  publish(_ctx: unknown, _event: DomainEventEnvelope): Promise<void> {
    return Promise.resolve();
  }
  subscribe(_eventType: string, _handler: DomainEventHandler): void {
    // no-op
  }
}

describe("orchestrator server", () => {
  let baseUrl: string;
  let close: () => Promise<void>;

  beforeEach(async () => {
    const deps = buildDependencies(new FakeEventBus());
    const server = createServer(deps);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
    close = () => new Promise((resolve) => server.close(() => resolve()));
  });

  afterEach(async () => {
    await close();
  });

  it("GET /health reports the wired dependencies and loaded plugin's capability", async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = (await response.json()) as {
      status: string;
      plugins: string[];
      capabilities: { id: string; providerId: string }[];
    };

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.plugins).toEqual(["fiori-generator"]);
    expect(body.capabilities.length).toBeGreaterThan(0);
    expect(body.capabilities[0]?.providerId).toBe("fiori-generator");
  });

  it("returns 404 for an unknown route", async () => {
    const response = await fetch(`${baseUrl}/no-such-route`);

    expect(response.status).toBe(404);
  });
});

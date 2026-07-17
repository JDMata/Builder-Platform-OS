import type { AddressInfo } from "node:net";
import { createServer as createHttpServer, type Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { sealSession } from "@sap-app-factory/auth-core";
import { createServer } from "./server.js";
import { buildFakeDependencies } from "./test-fake-dependencies.js";

/** A minimal stand-in for `apps/orchestrator` — records every request it receives and echoes a fixed response, so these tests prove the proxy's forwarding/auth behavior without depending on a real orchestrator process. */
function fakeOrchestrator(): {
  server: Server;
  baseUrl: Promise<string>;
  requests: {
    method: string;
    url: string;
    headers: Record<string, string | string[] | undefined>;
    body: unknown;
  }[];
} {
  const requests: {
    method: string;
    url: string;
    headers: Record<string, string | string[] | undefined>;
    body: unknown;
  }[] = [];
  const server = createHttpServer((req, res) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString("utf8");
      requests.push({
        method: req.method ?? "",
        url: req.url ?? "",
        headers: req.headers,
        body: raw.length > 0 ? JSON.parse(raw) : undefined,
      });
      res.writeHead(200, { "content-type": "application/json" });
      res.end(JSON.stringify({ echoed: true }));
    });
  });
  const baseUrl = new Promise<string>((resolve) => {
    server.listen(0, () => {
      const { port } = server.address() as AddressInfo;
      resolve(`http://127.0.0.1:${port}`);
    });
  });
  return { server, baseUrl, requests };
}

describe("discovery proxy routes", () => {
  let apiGatewayServer: Server;
  let orchestrator: ReturnType<typeof fakeOrchestrator>;
  let baseUrl: string;
  const sessionSecret = "test-session-secret";

  beforeEach(async () => {
    orchestrator = fakeOrchestrator();
    const orchestratorUrl = await orchestrator.baseUrl;
    const deps = buildFakeDependencies({ sessionSecret, orchestratorUrl });
    apiGatewayServer = createServer(deps);
    await new Promise<void>((resolve) => apiGatewayServer.listen(0, resolve));
    const { port } = apiGatewayServer.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
  });

  afterEach(async () => {
    await new Promise((resolve) => apiGatewayServer.close(resolve));
    await new Promise((resolve) => orchestrator.server.close(resolve));
  });

  function sessionCookie(): string {
    const sealed = sealSession(
      { tenantId: "tenant-1", actorId: "user-1", expiresAt: Date.now() + 60_000 },
      sessionSecret,
    );
    return `saf_session=${sealed}`;
  }

  it("POST /discovery/start returns 401 without a session cookie", async () => {
    const response = await fetch(`${baseUrl}/discovery/start`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workspaceId: "workspace-1", ideaText: "an idea" }),
    });

    expect(response.status).toBe(401);
    expect(orchestrator.requests).toHaveLength(0);
  });

  it("POST /discovery/start forwards tenantId/actorId derived from the session, never from the request body", async () => {
    const response = await fetch(`${baseUrl}/discovery/start`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: sessionCookie() },
      body: JSON.stringify({
        workspaceId: "workspace-1",
        ideaText: "an idea",
        tenantId: "attacker-supplied-tenant",
        actorId: "attacker-supplied-actor",
      }),
    });

    expect(response.status).toBe(200);
    expect(orchestrator.requests).toHaveLength(1);
    const forwarded = orchestrator.requests[0]!;
    expect(forwarded.method).toBe("POST");
    expect(forwarded.url).toBe("/discovery/start");
    expect(forwarded.body).toMatchObject({
      tenantId: "tenant-1",
      actorId: "user-1",
      workspaceId: "workspace-1",
      ideaText: "an idea",
    });
    expect((forwarded.body as { actorPermissions: string[] }).actorPermissions).toEqual([
      "requirement:submit",
      "requirement:clarify",
      "requirement:approve",
    ]);
  });

  it("POST /discovery/answer-clarification returns 401 without a session cookie", async () => {
    const response = await fetch(`${baseUrl}/discovery/answer-clarification`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(401);
  });

  it("POST /discovery/answer-clarification forwards the session identity and body fields", async () => {
    const response = await fetch(`${baseUrl}/discovery/answer-clarification`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: sessionCookie() },
      body: JSON.stringify({
        runId: "run-1",
        requirementDocumentId: "doc-1",
        clarificationId: "clar-1",
        answer: "an answer",
        round: 1,
      }),
    });

    expect(response.status).toBe(200);
    const forwarded = orchestrator.requests[0]!;
    expect(forwarded.url).toBe("/discovery/answer-clarification");
    expect(forwarded.body).toMatchObject({
      tenantId: "tenant-1",
      actorId: "user-1",
      runId: "run-1",
      requirementDocumentId: "doc-1",
      clarificationId: "clar-1",
      answer: "an answer",
      round: 1,
    });
  });

  it("POST /discovery/confirm returns 401 without a session cookie", async () => {
    const response = await fetch(`${baseUrl}/discovery/confirm`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(401);
  });

  it("POST /discovery/confirm forwards the session identity", async () => {
    const response = await fetch(`${baseUrl}/discovery/confirm`, {
      method: "POST",
      headers: { "content-type": "application/json", cookie: sessionCookie() },
      body: JSON.stringify({ runId: "run-1", requirementDocumentId: "doc-1" }),
    });

    expect(response.status).toBe(200);
    const forwarded = orchestrator.requests[0]!;
    expect(forwarded.url).toBe("/discovery/confirm");
    expect(forwarded.body).toMatchObject({
      tenantId: "tenant-1",
      actorId: "user-1",
      runId: "run-1",
      requirementDocumentId: "doc-1",
    });
  });

  it("GET /discovery/:id returns 401 without a session cookie", async () => {
    const response = await fetch(`${baseUrl}/discovery/doc-1`);

    expect(response.status).toBe(401);
  });

  it("GET /discovery/:id forwards the tenantId header derived from the session", async () => {
    const response = await fetch(`${baseUrl}/discovery/doc-1`, {
      headers: { cookie: sessionCookie() },
    });

    expect(response.status).toBe(200);
    const forwarded = orchestrator.requests[0]!;
    expect(forwarded.method).toBe("GET");
    expect(forwarded.url).toBe("/discovery/doc-1");
    expect(forwarded.headers["x-tenant-id"]).toBe("tenant-1");
  });

  describe("when orchestrator returns a non-JSON response", () => {
    let brokenOrchestrator: Server;
    let brokenApiGatewayServer: Server;
    let brokenBaseUrl: string;

    beforeEach(async () => {
      // A real HTML response, exactly what happened in practice: another
      // process (not orchestrator at all) answering on orchestrator's
      // configured URL. `response.json()` throwing on this must not crash
      // the whole api-gateway process (CI-A9) — it must produce a clean
      // 502, the same way any other proxy failure should.
      brokenOrchestrator = createHttpServer((_req, res) => {
        res.writeHead(200, { "content-type": "text/html" });
        res.end("<!DOCTYPE html><html><body>not orchestrator</body></html>");
      });
      const brokenOrchestratorUrl = await new Promise<string>((resolve) => {
        brokenOrchestrator.listen(0, () => {
          const { port } = brokenOrchestrator.address() as AddressInfo;
          resolve(`http://127.0.0.1:${port}`);
        });
      });
      const deps = buildFakeDependencies({ sessionSecret, orchestratorUrl: brokenOrchestratorUrl });
      brokenApiGatewayServer = createServer(deps);
      await new Promise<void>((resolve) => brokenApiGatewayServer.listen(0, resolve));
      const { port } = brokenApiGatewayServer.address() as AddressInfo;
      brokenBaseUrl = `http://127.0.0.1:${port}`;
    });

    afterEach(async () => {
      await new Promise((resolve) => brokenApiGatewayServer.close(resolve));
      await new Promise((resolve) => brokenOrchestrator.close(resolve));
    });

    it("returns 502 instead of crashing", async () => {
      const response = await fetch(`${brokenBaseUrl}/discovery/doc-1`, {
        headers: { cookie: sessionCookie() },
      });

      expect(response.status).toBe(502);
      const body = (await response.json()) as { error: string };
      expect(body.error).toContain("orchestrator request failed");

      // The process is still alive and serving other requests — the real
      // regression this test guards against is the whole server going down.
      const stillUp = await fetch(`${brokenBaseUrl}/discovery/doc-1`, {
        headers: { cookie: sessionCookie() },
      });
      expect(stillUp.status).toBe(502);
    });
  });
});

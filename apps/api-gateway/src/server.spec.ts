import type { AddressInfo } from "node:net";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { sealSession } from "@sap-app-factory/auth-core";
import { createServer } from "./server.js";
import { buildFakeDependencies } from "./test-fake-dependencies.js";

describe("api-gateway server", () => {
  let baseUrl: string;
  let close: () => Promise<void>;
  const deps = buildFakeDependencies();

  beforeEach(async () => {
    const server = createServer(deps);
    await new Promise<void>((resolve) => server.listen(0, resolve));
    const { port } = server.address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${port}`;
    close = () => new Promise((resolve) => server.close(() => resolve()));
  });

  afterEach(async () => {
    await close();
  });

  it("GET /health returns 200 with a status body", async () => {
    const response = await fetch(`${baseUrl}/health`);
    const body = (await response.json()) as { status: string; service: string };

    expect(response.status).toBe(200);
    expect(body).toEqual({ status: "ok", service: "api-gateway" });
  });

  it("returns 404 for an unknown route", async () => {
    const response = await fetch(`${baseUrl}/no-such-route`);

    expect(response.status).toBe(404);
  });

  it("GET /me returns 401 without a session cookie", async () => {
    const response = await fetch(`${baseUrl}/me`);

    expect(response.status).toBe(401);
  });

  it("GET /me returns the session's tenantId/actorId with a valid session cookie", async () => {
    const sealed = sealSession(
      { tenantId: "tenant-1", actorId: "user-1", expiresAt: Date.now() + 60_000 },
      deps.sessionSecret,
    );

    const response = await fetch(`${baseUrl}/me`, {
      headers: { cookie: `saf_session=${sealed}` },
    });
    const body = (await response.json()) as { tenantId: string; actorId: string };

    expect(response.status).toBe(200);
    expect(body).toEqual({ tenantId: "tenant-1", actorId: "user-1" });
  });

  it("GET /me returns 401 for an expired session cookie", async () => {
    const sealed = sealSession(
      { tenantId: "tenant-1", actorId: "user-1", expiresAt: Date.now() - 1000 },
      deps.sessionSecret,
    );

    const response = await fetch(`${baseUrl}/me`, {
      headers: { cookie: `saf_session=${sealed}` },
    });

    expect(response.status).toBe(401);
  });

  it("GET /me returns 401 for a session cookie sealed with the wrong secret", async () => {
    const sealed = sealSession(
      { tenantId: "tenant-1", actorId: "user-1", expiresAt: Date.now() + 60_000 },
      "a-different-secret",
    );

    const response = await fetch(`${baseUrl}/me`, {
      headers: { cookie: `saf_session=${sealed}` },
    });

    expect(response.status).toBe(401);
  });

  it("GET /me returns 401 when other cookies are present but not the session cookie", async () => {
    const response = await fetch(`${baseUrl}/me`, {
      headers: { cookie: "other_cookie=value; another=thing" },
    });

    expect(response.status).toBe(401);
  });

  it("GET /me tolerates a malformed cookie segment with no '=' in the header", async () => {
    const sealed = sealSession(
      { tenantId: "tenant-1", actorId: "user-1", expiresAt: Date.now() + 60_000 },
      deps.sessionSecret,
    );

    const response = await fetch(`${baseUrl}/me`, {
      headers: { cookie: `malformed_segment; saf_session=${sealed}` },
    });

    expect(response.status).toBe(200);
  });

  it("GET /me ignores unrelated cookies and only reads its own", async () => {
    const sealed = sealSession(
      { tenantId: "tenant-1", actorId: "user-1", expiresAt: Date.now() + 60_000 },
      deps.sessionSecret,
    );

    const response = await fetch(`${baseUrl}/me`, {
      headers: { cookie: `other_cookie=irrelevant; saf_session=${sealed}; another=value` },
    });

    expect(response.status).toBe(200);
  });
});

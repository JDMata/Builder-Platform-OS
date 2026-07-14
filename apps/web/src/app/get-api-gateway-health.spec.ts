import { afterEach, describe, expect, it, vi } from "vitest";
import { getApiGatewayHealth } from "./get-api-gateway-health.js";

describe("getApiGatewayHealth", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns ok: true with the response body when api-gateway is reachable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ status: "ok", service: "api-gateway" }),
      }),
    );

    const health = await getApiGatewayHealth();

    expect(health).toEqual({ ok: true, body: { status: "ok", service: "api-gateway" } });
  });

  it("returns ok: false without throwing when api-gateway is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connection refused")));

    const health = await getApiGatewayHealth();

    expect(health.ok).toBe(false);
  });
});

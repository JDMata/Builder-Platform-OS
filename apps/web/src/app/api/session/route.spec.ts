import { describe, expect, it } from "vitest";
import { GET } from "./route.js";

describe("GET /api/session", () => {
  it("always reports unauthenticated — real session logic arrives with SAF-17", async () => {
    const response = GET();
    const body = (await response.json()) as { authenticated: boolean };

    expect(body).toEqual({ authenticated: false });
  });
});

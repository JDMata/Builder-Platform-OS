import { describe, expect, it } from "vitest";
import { redact } from "./redact.js";

describe("redact", () => {
  it.each([
    "password",
    "secret",
    "token",
    "prompt",
    "authorization",
    "cookie",
    "credential",
    "apiKey",
    "api_key",
    "privateKey",
    "clientSecret",
    "accessToken",
    "refreshToken",
    "systemPrompt",
  ])("redacts a field named %s", (key) => {
    const result = redact({ [key]: "sensitive-value" }) as Record<string, unknown>;
    expect(result[key]).toBe("[REDACTED]");
  });

  it("leaves non-banned fields untouched", () => {
    const result = redact({ pluginId: "fiori-generator", artifactCount: 3 });
    expect(result).toEqual({ pluginId: "fiori-generator", artifactCount: 3 });
  });

  it("redacts banned keys inside nested objects", () => {
    const result = redact({
      request: { modelProfileId: "reasoning-large", prompt: "do not log me" },
    }) as { request: Record<string, unknown> };
    expect(result.request.prompt).toBe("[REDACTED]");
    expect(result.request.modelProfileId).toBe("reasoning-large");
  });

  it("redacts banned keys inside arrays of objects", () => {
    const result = redact([{ token: "abc" }, { pluginId: "ok" }]) as Record<string, unknown>[];
    expect(result[0]?.token).toBe("[REDACTED]");
    expect(result[1]?.pluginId).toBe("ok");
  });

  it("passes primitives through unchanged", () => {
    expect(redact("hello")).toBe("hello");
    expect(redact(42)).toBe(42);
    expect(redact(null)).toBe(null);
    expect(redact(undefined)).toBe(undefined);
  });
});

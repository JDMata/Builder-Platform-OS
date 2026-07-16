import { describe, expect, it } from "vitest";
import { resolveModel, splitSystemPrompt, toAnthropicRole } from "./request-mapping.js";

describe("resolveModel", () => {
  it("resolves a known logical model profile id to a concrete model", () => {
    expect(resolveModel("reasoning-large")).toBe("claude-opus-4-8");
    expect(resolveModel("reasoning-standard")).toBe("claude-sonnet-5");
  });

  it("falls back to the default model for an unmapped profile id", () => {
    expect(resolveModel("something-unmapped")).toBe("claude-sonnet-5");
  });
});

describe("splitSystemPrompt", () => {
  it("extracts and joins system messages, leaving the rest untouched", () => {
    const { system, rest } = splitSystemPrompt([
      { role: "system", content: "You are a helpful assistant." },
      { role: "system", content: "Never guess." },
      { role: "user", content: "hello" },
    ]);
    expect(system).toBe("You are a helpful assistant.\n\nNever guess.");
    expect(rest).toEqual([{ role: "user", content: "hello" }]);
  });

  it("returns undefined system when no system message is present", () => {
    const { system, rest } = splitSystemPrompt([{ role: "user", content: "hello" }]);
    expect(system).toBeUndefined();
    expect(rest).toHaveLength(1);
  });
});

describe("toAnthropicRole", () => {
  it("maps assistant to assistant", () => {
    expect(toAnthropicRole("assistant")).toBe("assistant");
  });

  it("maps user, system, and tool all to user (tool has no Anthropic message-role equivalent)", () => {
    expect(toAnthropicRole("user")).toBe("user");
    expect(toAnthropicRole("tool")).toBe("user");
  });
});

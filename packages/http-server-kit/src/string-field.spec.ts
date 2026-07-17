import { describe, expect, it } from "vitest";
import { stringField } from "./string-field.js";

describe("stringField", () => {
  it("returns the value unchanged when it is already a string", () => {
    expect(stringField("hello")).toBe("hello");
  });

  it("returns an empty string by default when the value is not a string", () => {
    expect(stringField(undefined)).toBe("");
    expect(stringField(null)).toBe("");
    expect(stringField(42)).toBe("");
    expect(stringField({ not: "a string" })).toBe("");
  });

  it("returns the given fallback when the value is not a string", () => {
    expect(stringField(null, "default-workspace")).toBe("default-workspace");
  });

  it("never returns the default '[object Object]' stringification of a non-string value", () => {
    const result = stringField({ a: 1 });

    expect(result).not.toContain("object");
  });
});

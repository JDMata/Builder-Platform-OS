import { describe, expect, it } from "vitest";
import { retryWithBackoff } from "./retry-with-backoff.js";

function makeFlakyFn(failuresBeforeSuccess: number) {
  let calls = 0;
  return async () => {
    calls += 1;
    if (calls <= failuresBeforeSuccess) {
      throw new Error(`transient failure ${calls}`);
    }
    return "ok";
  };
}

describe("retryWithBackoff", () => {
  it("succeeds on the first attempt when the function doesn't fail", async () => {
    const result = await retryWithBackoff(makeFlakyFn(0), {
      maxAttempts: 3,
      timeoutMs: 1000,
      baseBackoffMs: 1,
    });
    expect(result).toBe("ok");
  });

  it("retries a transient failure and eventually succeeds", async () => {
    const result = await retryWithBackoff(makeFlakyFn(2), {
      maxAttempts: 3,
      timeoutMs: 1000,
      baseBackoffMs: 1,
    });
    expect(result).toBe("ok");
  });

  it("gives up after maxAttempts and surfaces the last error", async () => {
    await expect(
      retryWithBackoff(makeFlakyFn(5), { maxAttempts: 2, timeoutMs: 1000, baseBackoffMs: 1 }),
    ).rejects.toThrow(/transient failure/);
  });

  it("times out a call that never resolves", async () => {
    const hanging = () => new Promise<string>(() => {});
    await expect(
      retryWithBackoff(hanging, { maxAttempts: 1, timeoutMs: 5, baseBackoffMs: 1 }),
    ).rejects.toThrow(/timed out/);
  });
});

import { describe, expect, it } from "vitest";
import { sealSession, unsealSession, type SessionPayload } from "./session-cookie.js";

const SECRET = "test-secret-do-not-use-in-production";

function payload(overrides: Partial<SessionPayload> = {}): SessionPayload {
  return {
    tenantId: "tenant-1",
    actorId: "user-1",
    expiresAt: Date.now() + 60_000,
    ...overrides,
  };
}

describe("sealSession / unsealSession", () => {
  it("round-trips a valid, unexpired payload", () => {
    const original = payload();

    const sealed = sealSession(original, SECRET);
    const unsealed = unsealSession(sealed, SECRET);

    expect(unsealed).toEqual(original);
  });

  it("produces an opaque string that doesn't leak the payload in plaintext", () => {
    const sealed = sealSession(payload({ tenantId: "very-secret-tenant-id" }), SECRET);

    expect(sealed).not.toContain("very-secret-tenant-id");
  });

  it("returns undefined for an expired payload", () => {
    const sealed = sealSession(payload({ expiresAt: Date.now() - 1000 }), SECRET);

    expect(unsealSession(sealed, SECRET)).toBeUndefined();
  });

  it("returns undefined when unsealed with the wrong secret", () => {
    const sealed = sealSession(payload(), SECRET);

    expect(unsealSession(sealed, "wrong-secret")).toBeUndefined();
  });

  it("returns undefined for a tampered ciphertext (authenticated encryption)", () => {
    const sealed = sealSession(payload(), SECRET);
    const [iv, authTag, ciphertext] = sealed.split(".");
    const tampered = [iv, authTag, `${ciphertext}tampered`].join(".");

    expect(unsealSession(tampered, SECRET)).toBeUndefined();
  });

  it("returns undefined for garbage input", () => {
    expect(unsealSession("not-a-real-sealed-cookie", SECRET)).toBeUndefined();
  });

  it("generates a fresh IV per call, so sealing the same payload twice differs", () => {
    const same = payload({ expiresAt: 1_800_000_000_000 });

    const sealedOnce = sealSession(same, SECRET);
    const sealedTwice = sealSession(same, SECRET);

    expect(sealedOnce).not.toBe(sealedTwice);
  });

  it("returns undefined when the decrypted content isn't a well-formed SessionPayload", () => {
    // Seals a payload missing required fields, proving the shape-validation
    // guard runs, not just the crypto layer.
    const sealed = sealSession({ tenantId: "t1" } as unknown as SessionPayload, SECRET);

    expect(unsealSession(sealed, SECRET)).toBeUndefined();
  });
});

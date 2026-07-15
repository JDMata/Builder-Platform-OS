import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

export interface SessionPayload {
  readonly tenantId: string;
  readonly actorId: string;
  readonly expiresAt: number;
}

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH_BYTES = 12;

/**
 * Stateless, sealed (encrypted + authenticated) session cookie — no session
 * store exists yet (Redis is deliberately deferred, see infra/README.md), so
 * the cookie itself carries the minimal session payload, encrypted with
 * AES-256-GCM so its content is opaque and tamper-evident to the browser.
 * `secret` is a caller-supplied 32-byte key (never hardcoded here) — reduced
 * via SHA-256 so any string secret of any length becomes a valid key,
 * matching how most cookie-sealing libraries accept an arbitrary passphrase.
 */
function deriveKey(secret: string): Buffer {
  return createHash("sha256").update(secret).digest();
}

function isSessionPayload(value: unknown): value is SessionPayload {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as Record<string, unknown>).tenantId === "string" &&
    typeof (value as Record<string, unknown>).actorId === "string" &&
    typeof (value as Record<string, unknown>).expiresAt === "number"
  );
}

export function sealSession(payload: SessionPayload, secret: string): string {
  const key = deriveKey(secret);
  const iv = randomBytes(IV_LENGTH_BYTES);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return [iv, authTag, ciphertext].map((buf) => buf.toString("base64url")).join(".");
}

/**
 * Returns `undefined` for anything that fails to decrypt/parse/has expired —
 * never throws. A session cookie is untrusted input the moment it crosses
 * the network; the caller always gets a clean "no valid session" signal
 * rather than having to catch a decryption exception itself.
 */
export function unsealSession(sealed: string, secret: string): SessionPayload | undefined {
  try {
    const [ivPart, authTagPart, ciphertextPart] = sealed.split(".");
    if (!ivPart || !authTagPart || !ciphertextPart) {
      return undefined;
    }
    const key = deriveKey(secret);
    const iv = Buffer.from(ivPart, "base64url");
    const authTag = Buffer.from(authTagPart, "base64url");
    const ciphertext = Buffer.from(ciphertextPart, "base64url");

    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
    const parsed: unknown = JSON.parse(plaintext.toString("utf8"));

    if (!isSessionPayload(parsed) || parsed.expiresAt <= Date.now()) {
      return undefined;
    }
    return parsed;
  } catch {
    return undefined;
  }
}

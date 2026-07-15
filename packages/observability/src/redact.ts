const BANNED_KEY_SUBSTRINGS = [
  "password",
  "secret",
  "token",
  "prompt",
  "authorization",
  "cookie",
  "credential",
  "apikey",
  "privatekey",
] as const;

const REDACTED = "[REDACTED]";

function isBannedKey(key: string): boolean {
  const normalized = key.toLowerCase().replace(/[_-]/g, "");
  return BANNED_KEY_SUBSTRINGS.some((banned) => normalized.includes(banned));
}

/**
 * Recursively redacts any field whose key looks like it might hold a secret,
 * a credential, or an LLM prompt/response — the operational form of
 * SECURITY_BASELINE.md's "no secret of any kind appears in logs" and
 * CODING_STANDARDS.md's "never log secret material... or full LLM
 * prompts/responses." Redaction happens by KEY, not by inspecting the value:
 * a logger has no way to know what a caller's field actually contains, so the
 * field's own name is the only signal available at this layer — a caller
 * naming a field `apiKey`/`clientSecret`/`prompt`/etc. gets it redacted
 * automatically rather than relying on every call site remembering not to
 * log it.
 */
export function redact(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => redact(item));
  }
  if (value !== null && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = isBannedKey(key) ? REDACTED : redact(val);
    }
    return result;
  }
  return value;
}

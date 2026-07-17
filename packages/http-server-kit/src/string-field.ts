/** Safely narrows an unknown-typed value (a parsed JSON body field, a `FormData` entry, ...) to a string, without risking `no-base-to-string`-flagged stringification of a non-string value. */
export function stringField(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

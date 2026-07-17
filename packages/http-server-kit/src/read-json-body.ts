import type { IncomingMessage } from "node:http";

/** Reads and parses a raw `node:http` request body as JSON — `{}` for an empty body, never `undefined`. */
export async function readJsonBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw.length > 0 ? (JSON.parse(raw) as Record<string, unknown>) : {};
}

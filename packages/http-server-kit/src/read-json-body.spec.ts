import { Readable } from "node:stream";
import { describe, expect, it } from "vitest";
import type { IncomingMessage } from "node:http";
import { readJsonBody } from "./read-json-body.js";

function fakeRequest(body: string): IncomingMessage {
  return Readable.from([Buffer.from(body, "utf8")]) as unknown as IncomingMessage;
}

describe("readJsonBody", () => {
  it("parses a JSON object body", async () => {
    const result = await readJsonBody(fakeRequest(JSON.stringify({ a: 1, b: "two" })));

    expect(result).toEqual({ a: 1, b: "two" });
  });

  it("returns an empty object for an empty body", async () => {
    const result = await readJsonBody(fakeRequest(""));

    expect(result).toEqual({});
  });

  it("reassembles a body delivered across multiple chunks", async () => {
    const req = Readable.from([
      Buffer.from('{"chunk', "utf8"),
      Buffer.from('ed":true}', "utf8"),
    ]) as unknown as IncomingMessage;

    const result = await readJsonBody(req);

    expect(result).toEqual({ chunked: true });
  });
});

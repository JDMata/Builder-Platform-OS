import { afterEach, describe, expect, it, vi } from "vitest";
import {
  answerClarification,
  answerClarifications,
  confirmDiscovery,
  fetchAuthenticatedSession,
  fetchDiscoveryState,
  startDiscovery,
} from "./api-gateway-client";

function jsonResponse(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) };
}

describe("fetchAuthenticatedSession", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the session when api-gateway confirms the cookie", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(200, { tenantId: "tenant-1", actorId: "user-1" })),
    );

    const session = await fetchAuthenticatedSession("saf_session=sealed");

    expect(session).toEqual({ tenantId: "tenant-1", actorId: "user-1" });
  });

  it("returns undefined when api-gateway responds 401", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(401, { error: "not_authenticated" })),
    );

    const session = await fetchAuthenticatedSession("");

    expect(session).toBeUndefined();
  });

  it("returns undefined without throwing when api-gateway is unreachable", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("connection refused")));

    const session = await fetchAuthenticatedSession("saf_session=sealed");

    expect(session).toBeUndefined();
  });
});

describe("fetchDiscoveryState", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns the parsed state on success", async () => {
    const state = {
      document: { id: "doc-1", status: "draft" },
      requirements: [],
      clarifications: [],
      unansweredClarifications: [],
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, state)));

    const result = await fetchDiscoveryState("saf_session=sealed", "doc-1");

    expect(result).toEqual(state);
  });

  it("returns undefined on a 404", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(404, { error: "not_found" })));

    const result = await fetchDiscoveryState("saf_session=sealed", "missing");

    expect(result).toBeUndefined();
  });
});

describe("startDiscovery", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns ok:true with the response on success", async () => {
    const body = {
      runId: "run-1",
      document: { id: "doc-1" },
      unansweredClarifications: [],
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, body)));

    const result = await startDiscovery("saf_session=sealed", {
      workspaceId: "workspace-1",
      ideaText: "an idea",
    });

    expect(result).toEqual({ ok: true, value: body });
  });

  it("returns ok:false with the server's error message on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(400, { error: "Idea text must not be empty" })),
    );

    const result = await startDiscovery("saf_session=sealed", {
      workspaceId: "workspace-1",
      ideaText: "",
    });

    expect(result).toEqual({ ok: false, error: "Idea text must not be empty" });
  });
});

describe("answerClarification / answerClarifications", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("answerClarifications submits every answer in order and returns the last result", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse(200, {
          document: { id: "doc-1" },
          unansweredClarifications: [{ id: "c2", status: "unanswered" }],
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse(200, { document: { id: "doc-1" }, unansweredClarifications: [] }),
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await answerClarifications("saf_session=sealed", {
      runId: "run-1",
      requirementDocumentId: "doc-1",
      round: 1,
      answers: [
        { clarificationId: "c1", answer: "answer one" },
        { clarificationId: "c2", answer: "answer two" },
      ],
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.ok).toBe(true);
    expect(result.value?.unansweredClarifications).toEqual([]);
  });

  it("answerClarifications stops and returns the failure if a submission fails partway through", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(400, { error: "Clarification is already answered" }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await answerClarifications("saf_session=sealed", {
      runId: "run-1",
      requirementDocumentId: "doc-1",
      round: 1,
      answers: [
        { clarificationId: "c1", answer: "answer one" },
        { clarificationId: "c2", answer: "answer two" },
      ],
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ ok: false, error: "Clarification is already answered" });
  });

  it("answerClarification returns ok:false on a server error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(400, { error: "not found" })));

    const result = await answerClarification("saf_session=sealed", {
      runId: "run-1",
      requirementDocumentId: "doc-1",
      clarificationId: "c1",
      answer: "an answer",
      round: 1,
    });

    expect(result).toEqual({ ok: false, error: "not found" });
  });
});

describe("confirmDiscovery", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns ok:true with the created project", async () => {
    const project = {
      id: "project-1",
      workspaceId: "workspace-1",
      name: "Shift-End Stock Reconciliation",
      description: "desc",
      sourceRequirementDocumentId: "doc-1",
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, { project })));

    const result = await confirmDiscovery("saf_session=sealed", {
      runId: "run-1",
      requirementDocumentId: "doc-1",
    });

    expect(result).toEqual({ ok: true, value: { project } });
  });

  it("returns ok:false when confirmation fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(jsonResponse(400, { error: "unanswered clarifications remain" })),
    );

    const result = await confirmDiscovery("saf_session=sealed", {
      runId: "run-1",
      requirementDocumentId: "doc-1",
    });

    expect(result).toEqual({ ok: false, error: "unanswered clarifications remain" });
  });
});

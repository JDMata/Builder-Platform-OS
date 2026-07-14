import { describe, expect, it } from "vitest";
import { recordAuditEvent } from "./audit-event.js";

describe("AuditEvent", () => {
  it("records an event with the given fields", () => {
    const event = recordAuditEvent({
      id: "ae1",
      tenantId: "t1",
      actorId: "u1",
      action: "workflow.run.started",
      occurredAt: "2026-07-14T00:00:00.000Z",
    });

    expect(event.action).toBe("workflow.run.started");
    expect(event.tenantId).toBe("t1");
  });

  it("rejects an empty action", () => {
    expect(() =>
      recordAuditEvent({
        id: "ae1",
        tenantId: "t1",
        actorId: "u1",
        action: " ",
        occurredAt: "2026-07-14T00:00:00.000Z",
      }),
    ).toThrow(/action must not be empty/);
  });
});

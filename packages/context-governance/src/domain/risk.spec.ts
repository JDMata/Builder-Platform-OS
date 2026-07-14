import { describe, expect, it } from "vitest";
import { acceptRisk, identifyRisk, mitigateRisk } from "./risk.js";

describe("Risk", () => {
  it("is identified with a severity", () => {
    const risk = identifyRisk({ id: "r1", projectId: "p1", description: "x", severity: "high" });
    expect(risk.status).toBe("identified");
    expect(risk.severity).toBe("high");
  });

  it("rejects an empty description", () => {
    expect(() =>
      identifyRisk({ id: "r1", projectId: "p1", description: " ", severity: "low" }),
    ).toThrow(/must not be empty/);
  });

  it("mitigate and accept transition status without mutating the original", () => {
    const risk = identifyRisk({ id: "r1", projectId: "p1", description: "x", severity: "medium" });
    const mitigated = mitigateRisk(risk);
    expect(mitigated.status).toBe("mitigated");
    expect(risk.status).toBe("identified");

    const accepted = acceptRisk(risk);
    expect(accepted.status).toBe("accepted");
  });
});

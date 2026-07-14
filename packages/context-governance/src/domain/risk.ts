/** See ADR-0021 — the ITIL-alignment principle stated since Sprint 0, now modeled. */
export type RiskSeverity = "low" | "medium" | "high" | "critical";
export type RiskStatus = "identified" | "mitigated" | "accepted";

export interface Risk {
  readonly id: string;
  readonly projectId: string;
  readonly description: string;
  readonly severity: RiskSeverity;
  readonly status: RiskStatus;
}

export function identifyRisk(input: {
  readonly id: string;
  readonly projectId: string;
  readonly description: string;
  readonly severity: RiskSeverity;
}): Risk {
  if (input.description.trim().length === 0) {
    throw new Error("Risk description must not be empty");
  }
  return {
    id: input.id,
    projectId: input.projectId,
    description: input.description,
    severity: input.severity,
    status: "identified",
  };
}

export function mitigateRisk(risk: Risk): Risk {
  return { ...risk, status: "mitigated" };
}

export function acceptRisk(risk: Risk): Risk {
  return { ...risk, status: "accepted" };
}

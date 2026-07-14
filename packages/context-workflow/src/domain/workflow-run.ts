/**
 * Domain-owned status type — deliberately NOT imported from
 * @sap-app-factory/ports. Domain depends on nothing outside its own context's
 * domain folder, not even ports (see ARCHITECTURE_PRINCIPLES.md § Dependency
 * rules and the domain-no-ports dependency-cruiser rule) — the values happen
 * to line up with WorkflowRunPort's status type today, but the two are free
 * to diverge; this is the business concept, that is the orchestration contract.
 */
export type WorkflowRunStatus =
  "pending" | "running" | "awaiting_approval" | "completed" | "failed" | "cancelled";

const TERMINAL_STATUSES: ReadonlySet<WorkflowRunStatus> = new Set([
  "completed",
  "failed",
  "cancelled",
]);

export interface WorkflowRun {
  readonly id: string;
  readonly workflowDefinitionId: string;
  readonly workflowDefinitionVersion: number;
  readonly status: WorkflowRunStatus;
}

export function startWorkflowRun(input: {
  readonly id: string;
  readonly workflowDefinitionId: string;
  readonly workflowDefinitionVersion: number;
}): WorkflowRun {
  if (input.workflowDefinitionVersion < 1) {
    throw new Error("workflowDefinitionVersion must be >= 1 — see aggregate design rule 6");
  }
  return {
    id: input.id,
    workflowDefinitionId: input.workflowDefinitionId,
    workflowDefinitionVersion: input.workflowDefinitionVersion,
    status: "pending",
  };
}

/** A run in a terminal status can never transition again — it is done. */
export function transitionWorkflowRun(run: WorkflowRun, next: WorkflowRunStatus): WorkflowRun {
  if (TERMINAL_STATUSES.has(run.status)) {
    throw new Error(`WorkflowRun ${run.id} is already terminal (${run.status})`);
  }
  return { ...run, status: next };
}

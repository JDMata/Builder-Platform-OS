/**
 * `nodeType` is an opaque, registry-declared string (the core never
 * interprets it — see ADR-0021). `sourceRef` points at the real data this
 * node represents; the node itself never duplicates that data.
 */
export type DigitalTwinNodeStatus = "active" | "retired";

export interface SourceRef {
  readonly context: string;
  readonly aggregateId: string;
  readonly version: string;
}

export interface DigitalTwinNode {
  readonly id: string;
  readonly projectId: string;
  readonly nodeType: string;
  readonly sourceRef: SourceRef;
  readonly label: string;
  readonly status: DigitalTwinNodeStatus;
}

export function createDigitalTwinNode(input: {
  readonly id: string;
  readonly projectId: string;
  readonly nodeType: string;
  readonly sourceRef: SourceRef;
  readonly label: string;
}): DigitalTwinNode {
  if (input.label.trim().length === 0) {
    throw new Error("DigitalTwinNode label must not be empty");
  }
  return {
    id: input.id,
    projectId: input.projectId,
    nodeType: input.nodeType,
    sourceRef: input.sourceRef,
    label: input.label,
    status: "active",
  };
}

/** Never hard-deleted — retired, per aggregate design rule 5. */
export function retireDigitalTwinNode(node: DigitalTwinNode): DigitalTwinNode {
  return { ...node, status: "retired" };
}

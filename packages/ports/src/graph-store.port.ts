import type { RequestContext } from "./request-context.js";

/**
 * See ADR-0021 (Project Digital Twin) and docs/architecture/16-project-digital-twin.md.
 * Apache AGE on the platform's existing Postgres instance is the default
 * adapter — that's an adapter concern, not part of this contract. Node/edge
 * types are opaque, registry-declared strings; this port never interprets them.
 */

export interface DigitalTwinNodeRef {
  readonly nodeId: string;
}

export interface SourceRef {
  readonly context: string;
  readonly aggregateId: string;
  readonly version: string;
}

export interface UpsertNodeRequest {
  readonly projectId: string;
  readonly nodeType: string;
  readonly sourceRef: SourceRef;
  readonly label: string;
  readonly status: string;
}

export type EdgeProvenance = "declared" | "ai-inferred";

export interface UpsertEdgeRequest {
  readonly projectId: string;
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly relationshipType: string;
  readonly provenance: EdgeProvenance;
  /** Required when provenance is 'ai-inferred' — see ADR-0021. */
  readonly confidence?: number;
}

export interface GraphTraversalRequest {
  readonly projectId: string;
  readonly fromNodeId: string;
  readonly relationshipTypes?: readonly string[];
  readonly maxDepth: number;
}

export interface DigitalTwinNodeSummary {
  readonly nodeId: string;
  readonly nodeType: string;
  readonly label: string;
  readonly status: string;
}

export interface DigitalTwinEdgeSummary {
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly relationshipType: string;
  readonly provenance: EdgeProvenance;
}

export interface GraphTraversalResult {
  readonly nodes: readonly DigitalTwinNodeSummary[];
  readonly edges: readonly DigitalTwinEdgeSummary[];
}

export interface GraphStorePort {
  upsertNode(ctx: RequestContext, request: UpsertNodeRequest): Promise<DigitalTwinNodeRef>;
  retireNode(ctx: RequestContext, nodeId: string): Promise<void>;
  upsertEdge(ctx: RequestContext, request: UpsertEdgeRequest): Promise<void>;
  retireEdge(ctx: RequestContext, edgeId: string, reason: string): Promise<void>;
  traverse(ctx: RequestContext, request: GraphTraversalRequest): Promise<GraphTraversalResult>;
  /** Returns the new snapshot's id. */
  snapshot(ctx: RequestContext, projectId: string): Promise<string>;
}

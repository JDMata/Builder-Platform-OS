import type { RequestContext } from "./request-context.js";

/**
 * See ADR-0021 §7 (search strategy). Structured graph search is served
 * directly by GraphStorePort.traverse — this port is specifically the
 * semantic/full-text search path (Postgres full-text + pgvector by default).
 */

export interface SearchQuery {
  readonly projectId: string;
  readonly queryText: string;
  readonly nodeTypes?: readonly string[];
  readonly limit?: number;
}

export interface SearchResult {
  readonly nodeId: string;
  readonly label: string;
  readonly nodeType: string;
  readonly relevanceScore: number;
}

export interface SearchIndexPort {
  search(ctx: RequestContext, query: SearchQuery): Promise<readonly SearchResult[]>;
  index(ctx: RequestContext, nodeId: string, content: string): Promise<void>;
}

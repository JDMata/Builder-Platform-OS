import type { RequestContext, TenancyTier } from "./request-context.js";

/**
 * See ADR-0013 (tenant isolation tiering). Given a tenant, resolves which
 * physical database/schema/region to use — the mechanism that makes moving a
 * tenant between Pooled/Silo/Dedicated an operational task, not a code change.
 */

export interface TenantConnectionDescriptor {
  readonly tenantId: string;
  readonly tenancyTier: TenancyTier;
  readonly databaseUrl: string;
  readonly schema: string;
  readonly region?: string;
}

export interface TenantConnectionResolverPort {
  resolve(ctx: RequestContext, tenantId: string): Promise<TenantConnectionDescriptor>;
}

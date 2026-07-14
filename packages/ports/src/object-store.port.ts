import type { RequestContext } from "./request-context.js";

/**
 * MinIO adapter today, S3/Blob/GCS-compatible later — see
 * docs/architecture/09-database-proposal.md. Postgres stores only the
 * `ObjectRef`/`ObjectMetadata`, never the blob itself.
 */

export interface ObjectRef {
  readonly bucket: string;
  readonly key: string;
}

export interface PutObjectRequest extends ObjectRef {
  readonly body: Uint8Array;
  readonly contentType?: string;
}

export interface ObjectMetadata extends ObjectRef {
  readonly sizeBytes: number;
  readonly contentHash: string;
  readonly contentType?: string;
}

export interface ObjectStorePort {
  put(ctx: RequestContext, request: PutObjectRequest): Promise<ObjectMetadata>;
  get(ctx: RequestContext, ref: ObjectRef): Promise<Uint8Array>;
  delete(ctx: RequestContext, ref: ObjectRef): Promise<void>;
  getSignedUrl(ctx: RequestContext, ref: ObjectRef, expirySeconds: number): Promise<string>;
}

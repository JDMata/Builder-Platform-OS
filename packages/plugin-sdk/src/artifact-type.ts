/**
 * A deliberately opaque, plugin-declared identifier (e.g. "fiori-elements-app").
 * The core treats it as a string it never interprets — see ADR-0006 and
 * ARCHITECTURE_PRINCIPLES.md. No SAP-specific vocabulary lives in this type.
 */
export type ArtifactType = string;

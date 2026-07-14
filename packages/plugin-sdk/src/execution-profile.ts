/** See ADR-0019 and docs/architecture/14-execution-profiles.md. */
export type ExecutionProfileId = "local-poc" | "hybrid" | "enterprise";

/**
 * Fixed, platform-defined enum — the one place the core is aware these
 * categories exist. No further SAP-specific detail (no mention of HANA,
 * XSUAA, SQLite) appears anywhere near this type.
 */
export type PortCategory =
  | "persistence"
  | "authentication"
  | "authorization"
  | "messaging"
  | "storage"
  | "sap-connectivity"
  | "external-api";

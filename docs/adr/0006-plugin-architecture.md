# 0006 — Plugin architecture for SAP-specific capabilities
Status: Proposed
Date: 2026-07-14

## Context
"No SAP-specific logic inside the core platform" is a stated principle, but the platform's entire purpose is producing SAP artifacts. Without a concrete mechanism, SAP knowledge will inevitably leak into core orchestration code as "just one special case" under delivery pressure, and that leakage compounds over a 10-year horizon.

## Decision
All SAP product knowledge (Fiori, SAPUI5, CAP Node/Java, RAP/ABAP, Integration Suite, BTP/CF/Kyma deployment specifics) is implemented as a `CapabilityPlugin` conforming to the minimal `packages/plugin-sdk` contract (manifest + `activate/validate/generate/deactivate` lifecycle — see [05-plugin-architecture.md](../architecture/05-plugin-architecture.md)), discovered and loaded by a plugin loader in `orchestrator`, and invoked only by capability ID resolved through the Capability & Plugin Registry — never by direct import of a named plugin from core code.

## Consequences
- Core orchestration code has literally no import path to a specific plugin, only to the loader/registry abstraction — enforced by a dependency-cruiser rule ([ADR-0002](0002-hexagonal-clean-layering.md)) plus a banned-keyword CI guard as a second line of defense ([12-risks-and-technical-debt.md](../architecture/12-risks-and-technical-debt.md)).
- Plugins can, in principle, be authored and versioned independently (including eventually by partners), because the contract package is small and stable.
- Plugin execution isolation starts as an in-process function call in Sprint 0 (acceptable — no plugin has real logic yet) but is explicitly tracked as needing process/container-level isolation before third-party or high-risk plugins are onboarded (risk R3 in [12-risks-and-technical-debt.md](../architecture/12-risks-and-technical-debt.md)).

## Alternatives considered
- **SAP-type-specific branches inside orchestrator/domain code** (`if (artifactType === 'fiori')`): rejected — this is precisely the anti-pattern the plugin architecture exists to prevent; it is the path of least resistance and therefore the one that must be structurally blocked.
- **A full plugin marketplace/sandboxed runtime from Sprint 0**: rejected as premature — no plugins with real logic exist yet; building sandboxing infrastructure before there's anything to sandbox is its own form of speculative complexity. The contract is designed so isolation can be added later without changing plugin authors' code.

## Related decision (2026-07-14)
[ADR-0019](0019-execution-profiles-for-generated-applications.md) extends this ADR's "no SAP-specific logic in core" rule to the platform's *output*: application-generating plugins must themselves scaffold generated code behind Ports & Adapters (Local POC / Hybrid / Enterprise execution profiles), never hardcoding SQLite/HANA/XSUAA-specific logic into a generated app's domain layer. That decision doesn't change anything in this ADR — it applies the same principle one level down, to what plugins produce rather than only to how plugins are invoked.

## Review update (2026-07-14)
Principal-architect self-review ([13-principal-architect-self-review.md](../architecture/13-principal-architect-self-review.md) §2.4) found that "isolation can be added later" was under-specified about *when* "later" is. At target scale (real generator plugins executing against untrusted requirement/artifact content, in a genuinely multi-tenant worker process), in-process execution stops being acceptable the moment any plugin has real generation logic — not only when a plugin is third-party. **Revised requirement:** process- or container-level isolation (separate OS process at minimum, container/microVM preferred), with enforced CPU/memory/time quotas and no default network egress, is a hard prerequisite before any plugin beyond the empty Sprint 0 stubs ships — first-party plugins included. This moves the corresponding backlog item out of "future risk" (R3 in [12-risks-and-technical-debt.md](../architecture/12-risks-and-technical-debt.md)) and into a Sprint 1/2 blocking requirement for the first real plugin. `plugin-sdk`'s `execute()` seam (already designed to hide the isolation mechanism from plugin authors) is unchanged — only the timeline for exercising it moved earlier.

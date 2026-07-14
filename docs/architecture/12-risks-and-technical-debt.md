# 12 — Risks & Technical Debt Prevention

## Risk register

| # | Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|---|
| R1 | SAP-specific logic leaks into core ("just one `if (artifactType === 'fiori')`") | High — undoes the entire plugin architecture over time | High (default path of least resistance under deadline pressure) | Banned-keyword CI guard + dependency-cruiser rule forbidding `plugins/*` imports outside `apps/*` (see below) |
| R2 | Workflow engine choice (in-house vs. Temporal) made emotionally instead of by evidence | High — this is the platform's core differentiator | Medium | Port-first design ([07](07-workflow-engine.md)); revisit via ADR once real workflow complexity is observed, not before |
| R3 | Plugin execution isolation stays "just a function call" indefinitely, becoming a security boundary in name only | Medium-High — third-party/partner plugins eventually run with too much ambient trust | Medium | Scoped capability tokens from Sprint 0 even while isolation is in-process ([05](05-plugin-architecture.md)); process/container isolation is a tracked backlog item, not an afterthought |
| R4 | Multi-LLM cost governance is an afterthought, leading to runaway spend once agents fan out | Medium | Medium-High | `CostBudget` aggregate and `UsageRecord` exist in the domain model from Sprint 0 ([02](02-domain-model.md)), even before enforcement logic ships |
| R5 | Premature microservice extraction reintroduces distributed-systems tax with no payoff | Medium | Medium | Modular-monolith-first ADR ([ADR-0003](../adr/0003-modular-monolith-first.md)) with explicit extraction criteria ([04](04-service-boundaries.md)) |
| R6 | Team skill gaps in OPA/Cedar policy-as-code or (if later adopted) Temporal slow delivery | Medium | Medium | Start with the simplest adapter that satisfies the port; invest in team ramp-up before, not during, the sprint that needs it |
| R7 | Event schema versioning discipline erodes ("just change the field, it's fine") | Medium | Medium | `dataVersion` + `.vN` in event type strings from day one ([06](06-event-model.md)); schema changes reviewed like API changes |
| R8 | Vendor lock-in creeps in through "convenience" SDK calls inside application code | High (long-term) | Medium | Adapter-only third-party SDK imports enforced by dependency-cruiser; contract tests per port |
| R9 | Scope creep during Sprint 0 — building a feature "while we're in there" | Medium | High | Explicit non-goals list ([00](00-vision-and-principles.md)); backlog captures the idea for a later sprint instead |
| R10 | Governance/audit trail is bolted on later instead of structural | High (compliance/PMO risk) | Medium if not addressed now | `AuditEvent` derivation from the event bus is part of the Sprint 0 domain model, not a future integration |

## Technical debt prevention strategy: architecture fitness functions

Principles are only as strong as their enforcement. Every principle in [00-vision-and-principles.md](00-vision-and-principles.md) maps to a mechanical, CI-failing check — a "fitness function" — so violations are caught before merge, not during a future audit:

| Principle | Fitness function | Where |
|---|---|---|
| No SAP logic in core | Grep-based CI guard scanning `domain/*`, `application/*`, `apps/*` (excluding `plugins/*`) for a banned keyword list (`fiori`, `sapui5`, `abap`, `rap`, `cds`, `odata`, `btp`, `cloudfoundry`, `kyma` — case-insensitive, allowlist for comments referencing this doc) | CI stage "Architecture fitness checks" |
| Hexagonal layering | `dependency-cruiser.config.cjs` encodes the layer rules from [01](01-high-level-architecture.md)/[03](03-monorepo-and-packages.md) | CI "Lint" stage |
| Plugin isolation boundary | dependency-cruiser rule: only `apps/orchestrator`/`apps/worker` may depend on `plugins/*`, and only via `plugin-sdk`'s loader type, never a named plugin import | CI "Lint" stage |
| Port/adapter swappability | Shared contract test suites in `testing-kit`, required for every adapter | CI "Contract test" stage |
| Vendor neutrality | dependency-cruiser rule: third-party SDK packages (LLM/MCP/cloud SDKs) may only appear in `*-adapters/*` package.json files | CI "Lint" stage |
| Documentation-as-code | CI check: every package under `packages/`/`plugins/`/`apps/` must have a README with a "Purpose" and "Ports" section | CI "Architecture fitness checks" |
| Test coverage floors | Vitest coverage thresholds per layer ([10](10-coding-standards-and-naming.md)) | CI "Unit test" stage |
| ADR required for cross-cutting decisions | PR template checklist item + lightweight PR label `needs-adr`; reviewers block merge if a structural decision has no linked ADR | PR review, not automatable in Sprint 0 |

## Cadence

- **ADR review**: any Proposed ADR blocks related implementation work until Accepted (see [docs/adr/README.md](../adr/README.md)).
- **Quarterly architecture review**: revisit the risk register above, retire mitigated risks, and re-evaluate the two decisions explicitly flagged as provisional (workflow engine adapter choice, plugin isolation model) against real usage data.
- **Any violation of a fitness function is a build failure, not a warning** — a failing check that can be silenced by a config flag inevitably gets silenced under deadline pressure; these checks are wired to fail the pipeline outright.

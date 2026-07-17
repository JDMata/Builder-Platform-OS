# @sap-app-factory/http-server-kit

## Purpose
Generic, port-agnostic raw-HTTP-request helpers shared by every composition-root app that runs its own `node:http` server (`api-gateway`, `orchestrator`) and, for `stringField`, by `apps/web`'s Server Actions too — extracted per the VS-1 Engineering Retrospective's `CIP-001` to remove an identical `readJsonBody` copy-pasted across two apps and two independent `stringField` narrowing helpers. See [ENGINEERING_DECISION_LOG.md](../../ENGINEERING_DECISION_LOG.md).

## Ports
None — this package has zero port awareness by design, the same as `resilience-kit`. It's a utility, not an adapter.

## What's here
- `readJsonBody(req)` — reads and parses a raw request body as JSON, `{}` for an empty body.
- `stringField(value, fallback?)` — safely narrows an unknown-typed value (a parsed JSON body field, a `FormData` entry) to a string without risking `no-base-to-string`-flagged stringification of a non-string value.

Nothing else belongs here — nothing has been added here beyond what `CIP-001` required.

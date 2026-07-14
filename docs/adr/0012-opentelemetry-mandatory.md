# 0012 — OpenTelemetry as mandatory observability standard
Status: Accepted
Date: 2026-07-14

## Context
A platform orchestrating multiple agents, LLM calls, MCP tool invocations, and plugin executions across several services will be operationally opaque without consistent, correlated tracing/metrics/logging from day one. Retrofitting observability after services proliferate is expensive and typically incomplete.

## Decision
`packages/observability` provides shared OpenTelemetry SDK setup (tracing, metrics, structured logging) used by every `apps/*` process from Sprint 0, exporting to an OpenTelemetry Collector (`infra/otel-collector`). Every port invocation (LLM call, MCP call, workflow step, plugin `generate()`) is wrapped in a span by convention enforced through shared instrumentation helpers, not left to each call site to remember. Correlation IDs (`correlationId` in the event envelope, [06-event-model.md](../architecture/06-event-model.md)) tie traces back to a `WorkflowRun`.

## Consequences
- Every new adapter or plugin gets tracing "for free" if it uses the shared instrumentation helpers from `observability`, rather than needing bespoke logging.
- The Collector is vendor-neutral — backend (Jaeger, Grafana Tempo, Datadog, etc.) is a Collector export configuration, not an application-code dependency, consistent with no-vendor-lock-in.
- Requires discipline: instrumentation helpers must actually be used at every port boundary; a bypassed call site becomes an observability blind spot. Tracked implicitly by the port/contract-test discipline in [ADR-0002](0002-hexagonal-clean-layering.md), since a call that skips the shared adapter wrapper is also skipping the port itself.

## Alternatives considered
- **Per-service bespoke logging/metrics**: rejected — produces inconsistent formats that can't be correlated across a multi-agent workflow trace, defeating the purpose of observability in exactly the scenario (agent orchestration) where it matters most.
- **Defer observability until after Sprint 0 features exist**: rejected — retrofitting tracing/correlation IDs into an event model and port layer already in production use is materially more expensive than building it in from the first package.
- **Vendor-specific APM SDK (e.g., a proprietary agent) instead of OpenTelemetry**: rejected — direct violation of no-vendor-lock-in; OpenTelemetry's Collector pattern achieves the same backend flexibility without coupling application code to one vendor's SDK.

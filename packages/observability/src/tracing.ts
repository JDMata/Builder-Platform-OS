import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { trace, type Tracer } from "@opentelemetry/api";

export interface StartTracingOptions {
  readonly serviceName: string;
  /** OTLP/HTTP Collector base URL, e.g. `http://localhost:4318` — the caller's `main.ts` reads this from `process.env`, never this package (CODING_STANDARDS.md § Dependency Injection: only `apps/*`'s composition root touches `process.env`). */
  readonly otlpEndpoint: string;
}

export interface TracingHandle {
  readonly tracer: Tracer;
  shutdown(): Promise<void>;
}

/**
 * Once `startTracing()` has run, any module in the process can get a working
 * tracer bound to the registered global provider this way — the standard
 * OpenTelemetry usage pattern (the API package's global registry is the
 * documented mechanism, not a bespoke service locator this platform invented)
 * — so call sites (`server.ts`, `invoke-plugin.ts`, ...) never need
 * `@opentelemetry/api` as their own direct dependency.
 */
export function getTracer(serviceName: string): Tracer {
  return trace.getTracer(serviceName);
}

/**
 * Called once, first thing, in each app's composition root (ADR-0012:
 * "`packages/observability` provides shared OpenTelemetry SDK setup...
 * exporting to an OpenTelemetry Collector"). `NodeTracerProvider.register()`
 * installs the default W3C Trace Context propagator and an async-hooks
 * context manager — both needed for `withSpan`/`http-propagation.ts` to work
 * across `await` boundaries and across an HTTP call. The Collector is the
 * only place that knows about a real trace backend (`infra/otel-collector`
 * exports to `debug`/stdout in Sprint 0) — swapping to Jaeger/Tempo/Datadog
 * later is a Collector config change, never a change here (no-vendor-lock-in).
 */
export function startTracing(options: StartTracingOptions): TracingHandle {
  const exporter = new OTLPTraceExporter({ url: `${options.otlpEndpoint}/v1/traces` });
  const provider = new NodeTracerProvider({
    resource: resourceFromAttributes({ [ATTR_SERVICE_NAME]: options.serviceName }),
    spanProcessors: [new BatchSpanProcessor(exporter)],
  });
  provider.register();

  return {
    tracer: trace.getTracer(options.serviceName),
    shutdown: () => provider.shutdown(),
  };
}

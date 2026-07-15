/**
 * Next.js's official server-instrumentation hook (SAF-16, ADR-0012): called
 * once per server instance, before any request is handled. Guarded by
 * `NEXT_RUNTIME` because this file also runs under the edge runtime, which
 * can't load Node-only OpenTelemetry packages — `web` never uses the edge
 * runtime today, but the guard is the documented, correct pattern regardless.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startTracing } = await import("@sap-app-factory/observability");
    startTracing({
      serviceName: "web",
      otlpEndpoint: process.env.SAF_OTEL_EXPORTER_URL ?? "http://localhost:4318",
    });
  }
}

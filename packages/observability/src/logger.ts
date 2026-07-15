import { trace } from "@opentelemetry/api";
import type { CorrelationFields } from "./correlation.js";
import { redact } from "./redact.js";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogFields {
  readonly [key: string]: unknown;
}

export interface Logger {
  debug(message: string, correlation: CorrelationFields, fields?: LogFields): void;
  info(message: string, correlation: CorrelationFields, fields?: LogFields): void;
  warn(message: string, correlation: CorrelationFields, fields?: LogFields): void;
  error(message: string, correlation: CorrelationFields, fields?: LogFields): void;
}

/**
 * The shared structured logger CODING_STANDARDS.md's Logging section calls
 * for: never bare `console.*` (writes via `process.stdout.write` instead,
 * since `no-console` is lint-enforced with no `apps/*` exemption — see
 * SAF-4), every line carries `correlationId`/`tenantId` automatically from
 * the caller's correlation fields (a line that can't be tied back to a
 * request is treated as a bug in the calling code, not the logger), and
 * every field passed in `fields` is redacted (see redact.ts) before being
 * serialized — a caller can't accidentally leak a secret/token/prompt by
 * naming a field one of the banned patterns. When called inside an active
 * span, `traceId`/`spanId` are attached too, so a log line and the trace it
 * belongs to can be correlated in the Collector/backend.
 */
export function createLogger(serviceName: string): Logger {
  function write(
    level: LogLevel,
    message: string,
    correlation: CorrelationFields,
    fields: LogFields,
  ): void {
    const spanContext = trace.getActiveSpan()?.spanContext();
    const line = {
      time: new Date().toISOString(),
      level,
      service: serviceName,
      message,
      correlationId: correlation.correlationId,
      tenantId: correlation.tenantId,
      actorId: correlation.actorId,
      workflowId: correlation.workflowId,
      executionId: correlation.executionId,
      projectId: correlation.projectId,
      ...(spanContext ? { traceId: spanContext.traceId, spanId: spanContext.spanId } : {}),
      ...(redact(fields) as Record<string, unknown>),
    };
    process.stdout.write(`${JSON.stringify(line)}\n`);
  }

  return {
    debug: (message, correlation, fields = {}) => write("debug", message, correlation, fields),
    info: (message, correlation, fields = {}) => write("info", message, correlation, fields),
    warn: (message, correlation, fields = {}) => write("warn", message, correlation, fields),
    error: (message, correlation, fields = {}) => write("error", message, correlation, fields),
  };
}

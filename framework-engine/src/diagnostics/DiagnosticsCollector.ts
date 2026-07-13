import type { ProviderResult } from '../providers/runtime/ProviderResponse.ts';
import { ExecutionMetrics, type ExecutionMetricsInput } from './ExecutionMetrics.ts';
import { ExecutionTrace, type ExecutionStage, type ExecutionTraceSnapshot } from './ExecutionTrace.ts';
import { EngineLogger } from './EngineLogger.ts';
import type { DiagnosticsSnapshot } from './DiagnosticsSnapshot.ts';

export interface DiagnosticsStartOptions {
  executionId?: string;
  startedAt?: number;
  metrics?: ExecutionMetricsInput;
}

export class DiagnosticsCollector {
  readonly logger: EngineLogger;
  private trace?: ExecutionTrace;
  private metrics = new ExecutionMetrics();

  constructor(logger = new EngineLogger({ level: 'SILENT' })) {
    this.logger = logger;
  }

  start(options: DiagnosticsStartOptions = {}): ExecutionTrace {
    this.trace = new ExecutionTrace(options.executionId, options.startedAt);
    this.metrics = new ExecutionMetrics(options.metrics);
    this.logger.debug('Execution diagnostics started', { executionId: this.trace.executionId });
    return this.trace;
  }

  startStage(stage: ExecutionStage, metadata?: Record<string, unknown>): void {
    this.ensureTrace().start(stage, Date.now(), metadata);
  }

  endStage(stage: ExecutionStage, metadata?: Record<string, unknown>): void {
    this.ensureTrace().end(stage, Date.now(), metadata);
  }

  recordMetrics(input: ExecutionMetricsInput): ExecutionMetrics {
    this.metrics = new ExecutionMetrics({ ...this.metrics, ...input });
    return this.metrics;
  }

  recordProviderResult(result: ProviderResult, prompt = ''): ExecutionMetrics {
    this.metrics = ExecutionMetrics.fromProviderResult(result, prompt);
    return this.metrics;
  }

  finish(completedAt = Date.now()): DiagnosticsSnapshot {
    const trace = this.ensureTrace().finish(completedAt);
    this.metrics = this.metrics.withTrace(trace);
    this.logger.debug('Execution diagnostics finished', {
      executionId: trace.executionId,
      durationMs: this.metrics.durationMs,
    });
    return { trace, metrics: this.metrics };
  }

  snapshot(): DiagnosticsSnapshot {
    const trace = this.ensureTrace().snapshot();
    return { trace, metrics: this.metrics.withTrace(trace) };
  }

  private ensureTrace(): ExecutionTrace {
    if (!this.trace) this.start();
    return this.trace as ExecutionTrace;
  }
}

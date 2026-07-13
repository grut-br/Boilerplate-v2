import type { ExecutionTraceSnapshot } from './ExecutionTrace.ts';
import type { ExecutionMetrics } from './ExecutionMetrics.ts';

export interface DiagnosticsSnapshot {
  trace: ExecutionTraceSnapshot;
  metrics: ExecutionMetrics;
}

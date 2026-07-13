export const EXECUTION_STAGES = [
  'Pipeline',
  'Hydration',
  'Provider',
  'Response',
  'Result',
  'Finished',
  'Bootstrap',
  'Context Resolution',
  'Markdown Loader',
  'Prompt Assembly',
  'Provider Execution',
  'Response Parsing',
  'Pipeline Result',
  'Completed',
] as const;

export type ExecutionStage = typeof EXECUTION_STAGES[number];

export interface TraceSpan {
  stage: ExecutionStage;
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
  metadata?: Record<string, unknown>;
}

export interface ExecutionTraceSnapshot {
  executionId: string;
  startedAt: number;
  completedAt?: number;
  durationMs?: number;
  spans: TraceSpan[];
}

export class ExecutionTrace {
  readonly executionId: string;
  readonly startedAt: number;
  private readonly spans: TraceSpan[] = [];
  private completedAt?: number;

  constructor(executionId = `execution-${Date.now()}`, startedAt = Date.now()) {
    this.executionId = executionId;
    this.startedAt = startedAt;
  }

  start(stage: ExecutionStage, startedAt = Date.now(), metadata?: Record<string, unknown>): TraceSpan {
    const span: TraceSpan = {
      stage,
      startedAt,
      ...(metadata ? { metadata: { ...metadata } } : {}),
    };
    this.spans.push(span);
    return span;
  }

  end(stage: ExecutionStage, completedAt = Date.now(), metadata?: Record<string, unknown>): TraceSpan {
    const span = [...this.spans].reverse().find((candidate) => candidate.stage === stage && candidate.completedAt === undefined);
    if (!span) return this.start(stage, completedAt, metadata);
    span.completedAt = completedAt;
    span.durationMs = Math.max(0, completedAt - span.startedAt);
    if (metadata) span.metadata = { ...span.metadata, ...metadata };
    return span;
  }

  finish(completedAt = Date.now()): ExecutionTraceSnapshot {
    this.completedAt = completedAt;
    return this.snapshot();
  }

  snapshot(): ExecutionTraceSnapshot {
    return {
      executionId: this.executionId,
      startedAt: this.startedAt,
      ...(this.completedAt === undefined ? {} : { completedAt: this.completedAt }),
      ...(this.completedAt === undefined ? {} : { durationMs: Math.max(0, this.completedAt - this.startedAt) }),
      spans: this.spans.map((span) => ({
        ...span,
        ...(span.metadata ? { metadata: { ...span.metadata } } : {}),
      })),
    };
  }
}

import type { ProviderResult } from '../providers/runtime/ProviderResponse.ts';
import type { ExecutionStage, ExecutionTraceSnapshot } from './ExecutionTrace.ts';

export type CacheStatus = 'hit' | 'miss' | 'unknown';

export interface ExecutionMetricsInput {
  durationMs?: number;
  totalDurationMs?: number;
  stageDurations?: Partial<Record<ExecutionStage, number>>;
  provider?: string;
  model?: string;
  estimatedPromptTokens?: number;
  estimatedCompletionTokens?: number;
  promptTokens?: number;
  completionTokens?: number;
  returnedTokens?: number;
  promptSize?: number;
  responseSize?: number;
  hydratedDocuments?: number;
  cache?: CacheStatus;
  cacheHit?: boolean;
  retries?: number;
  timeout?: boolean;
}

export class ExecutionMetrics {
  readonly durationMs: number;
  readonly totalDurationMs: number;
  readonly stageDurations: Partial<Record<ExecutionStage, number>>;
  readonly provider?: string;
  readonly model?: string;
  readonly estimatedPromptTokens: number;
  readonly estimatedCompletionTokens: number;
  readonly promptTokens: number;
  readonly completionTokens: number;
  readonly returnedTokens: number;
  readonly promptSize: number;
  readonly responseSize: number;
  readonly hydratedDocuments: number;
  readonly cache: CacheStatus;
  readonly cacheHit?: boolean;
  readonly retries: number;
  readonly timeout: boolean;

  constructor(input: ExecutionMetricsInput = {}) {
    this.totalDurationMs = input.totalDurationMs ?? input.durationMs ?? 0;
    this.durationMs = input.durationMs ?? this.totalDurationMs;
    this.stageDurations = { ...(input.stageDurations ?? {}) };
    this.provider = input.provider;
    this.model = input.model;
    this.estimatedPromptTokens = input.estimatedPromptTokens ?? 0;
    this.estimatedCompletionTokens = input.estimatedCompletionTokens ?? 0;
    this.promptTokens = input.promptTokens ?? 0;
    this.completionTokens = input.completionTokens ?? 0;
    this.returnedTokens = input.returnedTokens ?? this.promptTokens + this.completionTokens;
    this.promptSize = input.promptSize ?? 0;
    this.responseSize = input.responseSize ?? 0;
    this.hydratedDocuments = input.hydratedDocuments ?? 0;
    this.cache = input.cache ?? (input.cacheHit === undefined ? 'unknown' : input.cacheHit ? 'hit' : 'miss');
    this.cacheHit = input.cacheHit ?? (this.cache === 'unknown' ? undefined : this.cache === 'hit');
    this.retries = input.retries ?? 0;
    this.timeout = input.timeout ?? false;
  }

  static fromProviderResult(result: ProviderResult, prompt = ''): ExecutionMetrics {
    const response = result.response;
    return new ExecutionMetrics({
      durationMs: result.metrics.durationMs,
      provider: result.provider,
      model: response?.model,
      estimatedPromptTokens: result.metrics.estimatedPromptTokens,
      promptTokens: response?.usage.promptTokens,
      completionTokens: response?.usage.completionTokens,
      returnedTokens: response?.usage.totalTokens,
      promptSize: result.metrics.promptSize || prompt.length,
      responseSize: result.metrics.responseSize,
      timeout: result.error?.code === 'PROVIDER_TIMEOUT',
    });
  }

  withTrace(trace: ExecutionTraceSnapshot): ExecutionMetrics {
    const stageDurations = { ...this.stageDurations };
    for (const span of trace.spans) {
      if (span.durationMs !== undefined) stageDurations[span.stage] = span.durationMs;
    }
    return new ExecutionMetrics({ ...this, stageDurations, totalDurationMs: trace.durationMs ?? this.totalDurationMs, durationMs: trace.durationMs ?? this.durationMs });
  }
}

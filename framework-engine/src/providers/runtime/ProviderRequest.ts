export interface ProviderRequest {
  prompt: string;
  systemPrompt?: string;
  providerId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  metadata?: Record<string, string | number | boolean | undefined>;
}

export interface ProviderExecutionContext {
  requestId: string;
  workUnitId?: string;
  capability?: string;
  signal?: AbortSignal;
  timeoutMs?: number;
  startedAt: number;
}

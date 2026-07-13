export interface ProviderUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface ProviderResponse {
  content: string;
  provider: string;
  requestId: string;
  usage: ProviderUsage;
  model?: string;
  finishReason?: string;
  responseId?: string;
  durationMs?: number;
}

export interface ProviderMetrics {
  durationMs: number;
  estimatedPromptTokens: number;
  provider: string;
  promptSize: number;
  responseSize: number;
}

export interface ProviderErrorInfo {
  code: string;
  message: string;
  retryable: boolean;
}

export interface ProviderResult {
  success: boolean;
  provider: string;
  response?: ProviderResponse;
  metrics: ProviderMetrics;
  error?: ProviderErrorInfo;
}

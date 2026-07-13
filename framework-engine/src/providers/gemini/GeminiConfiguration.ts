import { ProviderError } from '../runtime/ProviderErrors.ts';
import type { ProviderConfiguration } from '../runtime/ProviderPort.ts';

export type GeminiFetch = (input: string, init?: RequestInit) => Promise<Response>;

export interface GeminiConfigurationOptions {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  timeoutMs?: number;
  temperature?: number;
  maxOutputTokens?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  fetcher?: GeminiFetch;
}

export class GeminiConfiguration implements ProviderConfiguration {
  readonly id = 'gemini';
  readonly type = 'gemini';
  readonly apiKey?: string;
  readonly model: string;
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly temperature?: number;
  readonly maxOutputTokens?: number;
  readonly maxRetries: number;
  readonly retryDelayMs: number;
  readonly fetcher: GeminiFetch;
  readonly options: Record<string, unknown>;

  constructor(options: GeminiConfigurationOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;
    this.model = options.model ?? process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';
    this.baseUrl = (options.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta/models').replace(/\/$/, '');
    this.timeoutMs = options.timeoutMs ?? this.environmentNumber('GEMINI_TIMEOUT', 30_000);
    this.temperature = options.temperature ?? this.environmentNumber('GEMINI_TEMPERATURE', 0.7);
    this.maxOutputTokens = options.maxOutputTokens ?? this.environmentNumber('GEMINI_MAX_OUTPUT_TOKENS', 2048);
    this.maxRetries = options.maxRetries ?? 2;
    this.retryDelayMs = options.retryDelayMs ?? 100;
    this.fetcher = options.fetcher ?? fetch;
    this.options = { model: this.model, timeoutMs: this.timeoutMs, maxOutputTokens: this.maxOutputTokens };
    this.validate();
  }

  private environmentNumber(name: string, fallback: number): number {
    const value = process.env[name];
    if (value === undefined || value === '') return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private validate(): void {
    if (!this.model.trim() || this.timeoutMs <= 0 || this.maxRetries < 0 || this.retryDelayMs < 0) {
      throw new ProviderError('INVALID_PROVIDER_CONFIGURATION', 'Invalid Gemini provider configuration.');
    }
    if (this.temperature !== undefined && (this.temperature < 0 || this.temperature > 2)) {
      throw new ProviderError('INVALID_PROVIDER_CONFIGURATION', 'Gemini temperature must be between 0 and 2.');
    }
    if (this.maxOutputTokens !== undefined && this.maxOutputTokens <= 0) {
      throw new ProviderError('INVALID_PROVIDER_CONFIGURATION', 'Gemini max output tokens must be positive.');
    }
  }
}

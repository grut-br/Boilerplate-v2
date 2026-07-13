import { ProviderError } from '../runtime/ProviderErrors.ts';
import type { ProviderConfiguration } from '../runtime/ProviderPort.ts';

export type OpenAIFetch = (input: string, init?: RequestInit) => Promise<Response>;

export interface OpenAIConfigurationOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  timeoutMs?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  temperature?: number;
  maxOutputTokens?: number;
  fetcher?: OpenAIFetch;
}

export class OpenAIConfiguration implements ProviderConfiguration {
  readonly id: string;
  readonly type = 'openai';
  readonly apiKey?: string;
  readonly baseUrl: string;
  readonly model: string;
  readonly timeoutMs: number;
  readonly maxRetries: number;
  readonly retryDelayMs: number;
  readonly temperature?: number;
  readonly maxOutputTokens?: number;
  readonly fetcher: OpenAIFetch;
  readonly options: Record<string, unknown>;

  constructor(options: OpenAIConfigurationOptions = {}) {
    this.id = 'openai';
    this.apiKey = options.apiKey;
    this.baseUrl = (options.baseUrl ?? 'https://api.openai.com/v1').replace(/\/$/, '');
    this.model = options.model ?? 'gpt-4.1-mini';
    this.timeoutMs = options.timeoutMs ?? 30_000;
    this.maxRetries = options.maxRetries ?? 2;
    this.retryDelayMs = options.retryDelayMs ?? 100;
    this.temperature = options.temperature;
    this.maxOutputTokens = options.maxOutputTokens;
    this.fetcher = options.fetcher ?? fetch;
    this.options = { model: this.model, timeoutMs: this.timeoutMs, maxRetries: this.maxRetries };
    this.validate();
  }

  private validate(): void {
    if (!this.model.trim() || this.timeoutMs <= 0 || this.maxRetries < 0 || this.retryDelayMs < 0) {
      throw new ProviderError('INVALID_PROVIDER_CONFIGURATION', 'Invalid OpenAI provider configuration.');
    }
    if (this.temperature !== undefined && (this.temperature < 0 || this.temperature > 2)) {
      throw new ProviderError('INVALID_PROVIDER_CONFIGURATION', 'OpenAI temperature must be between 0 and 2.');
    }
    if (this.maxOutputTokens !== undefined && this.maxOutputTokens <= 0) {
      throw new ProviderError('INVALID_PROVIDER_CONFIGURATION', 'OpenAI max output tokens must be positive.');
    }
  }
}

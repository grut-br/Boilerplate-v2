import { ProviderError } from '../runtime/ProviderErrors.ts';
import type { ProviderConfiguration } from '../runtime/ProviderPort.ts';

export type AnthropicFetch = (input: string, init?: RequestInit) => Promise<Response>;

export interface AnthropicConfigurationOptions {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  timeoutMs?: number;
  temperature?: number;
  maxOutputTokens?: number;
  maxRetries?: number;
  retryDelayMs?: number;
  fetcher?: AnthropicFetch;
}

export class AnthropicConfiguration implements ProviderConfiguration {
  readonly id = 'anthropic';
  readonly type = 'anthropic';
  readonly apiKey?: string;
  readonly model: string;
  readonly baseUrl: string;
  readonly timeoutMs: number;
  readonly temperature?: number;
  readonly maxOutputTokens: number;
  readonly maxRetries: number;
  readonly retryDelayMs: number;
  readonly fetcher: AnthropicFetch;
  readonly options: Record<string, unknown>;

  constructor(options: AnthropicConfigurationOptions = {}) {
    this.apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
    this.model = options.model ?? process.env.ANTHROPIC_MODEL ?? 'claude-3-5-sonnet-latest';
    this.baseUrl = (options.baseUrl ?? process.env.ANTHROPIC_BASE_URL ?? 'https://api.anthropic.com/v1').replace(/\/$/, '');
    this.timeoutMs = options.timeoutMs ?? this.environmentNumber('ANTHROPIC_TIMEOUT', 30_000);
    this.maxOutputTokens = options.maxOutputTokens
      ?? this.environmentNumber('ANTHROPIC_MAX_OUTPUT_TOKENS', 4096);
    this.temperature = options.temperature
      ?? this.environmentNumber('ANTHROPIC_TEMPERATURE', 0.7);
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
    if (!this.model.trim() || this.timeoutMs <= 0 || this.maxOutputTokens <= 0
      || this.maxRetries < 0 || this.retryDelayMs < 0) {
      throw new ProviderError('INVALID_PROVIDER_CONFIGURATION', 'Invalid Anthropic provider configuration.');
    }
    if (this.temperature !== undefined && (this.temperature < 0 || this.temperature > 1)) {
      throw new ProviderError('INVALID_PROVIDER_CONFIGURATION', 'Anthropic temperature must be between 0 and 1.');
    }
  }
}

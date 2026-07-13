import type { ProviderExecutionContext, ProviderRequest } from '../runtime/ProviderRequest.ts';
import type { ProviderCapabilities, ProviderPort } from '../runtime/ProviderPort.ts';
import type { ProviderResponse } from '../runtime/ProviderResponse.ts';
import { ProviderError } from '../runtime/ProviderErrors.ts';
import { GeminiConfiguration, type GeminiConfigurationOptions } from './GeminiConfiguration.ts';
import { GeminiErrorMapper } from './GeminiErrorMapper.ts';
import { GeminiMapper } from './GeminiMapper.ts';
import { GeminiResponseParser } from './GeminiResponseParser.ts';

export class GeminiProvider implements ProviderPort {
  readonly id = 'gemini';
  readonly configuration: GeminiConfiguration;
  private readonly mapper = new GeminiMapper();
  private readonly parser = new GeminiResponseParser();
  private readonly errors = new GeminiErrorMapper();

  constructor(configuration: GeminiConfigurationOptions | GeminiConfiguration = {}) {
    this.configuration = configuration instanceof GeminiConfiguration
      ? configuration
      : new GeminiConfiguration(configuration);
  }

  capabilities(): ProviderCapabilities {
    return { streaming: false, supportsTemperature: true, supportsMaxTokens: true };
  }

  async execute(request: ProviderRequest, context: ProviderExecutionContext): Promise<ProviderResponse> {
    if (!this.configuration.apiKey?.trim()) {
      throw new ProviderError('INVALID_PROVIDER_CONFIGURATION', 'GEMINI_API_KEY is not configured.');
    }
    if (!request.prompt?.trim()) {
      throw new ProviderError('INVALID_PAYLOAD', 'Gemini prompt cannot be empty.');
    }
    if (context.signal?.aborted) {
      throw new ProviderError('PROVIDER_CANCELLED', 'Gemini request was cancelled.');
    }
    const payload = this.mapper.toRequest(request, this.configuration);
    let lastError: ProviderError | undefined;
    for (let attempt = 0; attempt <= this.configuration.maxRetries; attempt += 1) {
      try {
        return await this.request(payload, context);
      } catch (error) {
        const mapped = error instanceof ProviderError ? error : this.errors.fromNetwork(error);
        if (!mapped.retryable || attempt >= this.configuration.maxRetries) throw mapped;
        lastError = mapped;
        await this.wait(this.configuration.retryDelayMs * (attempt + 1), context.signal);
      }
    }
    throw lastError ?? this.errors.fromNetwork(new Error('Gemini provider failed.'));
  }

  private async request(payload: ReturnType<GeminiMapper['toRequest']>, context: ProviderExecutionContext): Promise<ProviderResponse> {
    const controller = new AbortController();
    let timedOut = false;
    const cancel = () => controller.abort();
    context.signal?.addEventListener('abort', cancel, { once: true });
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, this.configuration.timeoutMs);
    const startedAt = Date.now();
    try {
      const response = await this.configuration.fetcher(this.mapper.endpoint(this.configuration), {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) {
        let body: unknown;
        try { body = await response.json(); } catch { body = await response.text().catch(() => undefined); }
        throw this.errors.fromHttp(response.status, body);
      }
      let body: unknown;
      try { body = await response.json(); } catch { throw this.errors.invalidResponse('Gemini returned invalid JSON.'); }
      return this.parser.parse(body, context.requestId, this.configuration.model, Date.now() - startedAt);
    } catch (error) {
      if (context.signal?.aborted) throw new ProviderError('PROVIDER_CANCELLED', 'Gemini request was cancelled.');
      if (timedOut || (error instanceof Error && error.name === 'AbortError')) {
        throw new ProviderError('PROVIDER_TIMEOUT', `Gemini request timed out after ${this.configuration.timeoutMs}ms.`);
      }
      if (error instanceof ProviderError) throw error;
      throw this.errors.fromNetwork(error);
    } finally {
      clearTimeout(timeout);
      context.signal?.removeEventListener('abort', cancel);
    }
  }

  private wait(milliseconds: number, signal?: AbortSignal): Promise<void> {
    if (milliseconds <= 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, milliseconds);
      const cancel = () => { clearTimeout(timer); reject(new ProviderError('PROVIDER_CANCELLED', 'Gemini request was cancelled.')); };
      if (signal?.aborted) cancel();
      else signal?.addEventListener('abort', cancel, { once: true });
    });
  }
}

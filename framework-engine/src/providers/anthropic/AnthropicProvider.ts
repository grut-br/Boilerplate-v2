import type { ProviderExecutionContext, ProviderRequest } from '../runtime/ProviderRequest.ts';
import { ProviderError } from '../runtime/ProviderErrors.ts';
import type { ProviderCapabilities, ProviderPort } from '../runtime/ProviderPort.ts';
import type { ProviderResponse } from '../runtime/ProviderResponse.ts';
import { AnthropicConfiguration, type AnthropicConfigurationOptions } from './AnthropicConfiguration.ts';
import { AnthropicErrorMapper } from './AnthropicErrorMapper.ts';
import { AnthropicMapper } from './AnthropicMapper.ts';
import { AnthropicResponseParser } from './AnthropicResponseParser.ts';

export class AnthropicProvider implements ProviderPort {
  readonly id = 'anthropic';
  readonly configuration: AnthropicConfiguration;
  private readonly mapper = new AnthropicMapper();
  private readonly parser = new AnthropicResponseParser();
  private readonly errors = new AnthropicErrorMapper();

  constructor(configuration: AnthropicConfigurationOptions | AnthropicConfiguration = {}) {
    this.configuration = configuration instanceof AnthropicConfiguration
      ? configuration
      : new AnthropicConfiguration(configuration);
  }

  capabilities(): ProviderCapabilities {
    return { streaming: false, supportsTemperature: true, supportsMaxTokens: true };
  }

  async execute(request: ProviderRequest, context: ProviderExecutionContext): Promise<ProviderResponse> {
    if (!this.configuration.apiKey?.trim()) {
      throw new ProviderError('INVALID_PROVIDER_CONFIGURATION', 'ANTHROPIC_API_KEY is not configured.');
    }
    if (!request.prompt?.trim()) {
      throw new ProviderError('INVALID_PAYLOAD', 'Anthropic prompt cannot be empty.');
    }
    if (context.signal?.aborted) {
      throw new ProviderError('PROVIDER_CANCELLED', 'Anthropic request was cancelled.');
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
    throw lastError ?? this.errors.fromNetwork(new Error('Anthropic provider failed.'));
  }

  private async request(
    payload: ReturnType<AnthropicMapper['toRequest']>,
    context: ProviderExecutionContext,
  ): Promise<ProviderResponse> {
    const controller = new AbortController();
    let timedOut = false;
    const cancel = () => controller.abort();
    context.signal?.addEventListener('abort', cancel, { once: true });
    const timeout = setTimeout(() => { timedOut = true; controller.abort(); }, this.configuration.timeoutMs);
    const startedAt = Date.now();
    try {
      const response = await this.configuration.fetcher(`${this.configuration.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'x-api-key': this.configuration.apiKey ?? '',
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) {
        let body: unknown;
        try { body = await response.json(); } catch { body = await response.text().catch(() => undefined); }
        throw this.errors.fromHttp(response.status, body);
      }
      let body: unknown;
      try { body = await response.json(); } catch { throw this.errors.invalidResponse('Anthropic returned invalid JSON.'); }
      return this.parser.parse(body, context.requestId, Date.now() - startedAt);
    } catch (error) {
      if (context.signal?.aborted) throw new ProviderError('PROVIDER_CANCELLED', 'Anthropic request was cancelled.');
      if (timedOut || (error instanceof Error && error.name === 'AbortError')) {
        throw new ProviderError('PROVIDER_TIMEOUT', `Anthropic request timed out after ${this.configuration.timeoutMs}ms.`);
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
      const cancel = () => {
        clearTimeout(timer);
        reject(new ProviderError('PROVIDER_CANCELLED', 'Anthropic request was cancelled.'));
      };
      if (signal?.aborted) cancel();
      else signal?.addEventListener('abort', cancel, { once: true });
    });
  }
}

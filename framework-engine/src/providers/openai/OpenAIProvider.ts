import type { HydratedContext } from '../../runtime/context/types.ts';
import { ProviderError } from '../runtime/ProviderErrors.ts';
import type { ProviderExecutionContext, ProviderRequest } from '../runtime/ProviderRequest.ts';
import type { ProviderCapabilities, ProviderPort } from '../runtime/ProviderPort.ts';
import type { ProviderResponse } from '../runtime/ProviderResponse.ts';
import { OpenAIConfiguration, type OpenAIConfigurationOptions } from './OpenAIConfiguration.ts';
import { OpenAIErrorMapper } from './OpenAIErrorMapper.ts';
import { OpenAIMapper } from './OpenAIMapper.ts';
import { OpenAIResponseParser } from './OpenAIResponseParser.ts';

export class OpenAIProvider implements ProviderPort {
  readonly id = 'openai';
  readonly configuration: OpenAIConfiguration;
  private readonly mapper = new OpenAIMapper();
  private readonly parser = new OpenAIResponseParser();
  private readonly errors = new OpenAIErrorMapper();

  constructor(configuration: OpenAIConfigurationOptions | OpenAIConfiguration = {}) {
    this.configuration = configuration instanceof OpenAIConfiguration
      ? configuration
      : new OpenAIConfiguration(configuration);
  }

  capabilities(): ProviderCapabilities {
    return { streaming: false, supportsTemperature: true, supportsMaxTokens: true };
  }

  async execute(request: ProviderRequest, context: ProviderExecutionContext): Promise<ProviderResponse> {
    if (!this.configuration.apiKey?.trim()) {
      throw new ProviderError('OPENAI_API_KEY_MISSING', 'OPENAI_API_KEY is not configured.');
    }
    if (context.signal?.aborted) {
      throw new ProviderError('OPENAI_CANCELLED', 'OpenAI request was cancelled.');
    }

    const payload = this.mapper.toRequest(request, this.configuration);
    let lastError: ProviderError | undefined;
    for (let attempt = 0; attempt <= this.configuration.maxRetries; attempt += 1) {
      try {
        return await this.request(payload, context);
      } catch (error) {
        const mapped = error instanceof ProviderError ? error : this.errors.fromNetwork(error);
        if (!this.canRetry(mapped, attempt)) {
          throw mapped;
        }
        lastError = mapped;
        await this.wait(this.configuration.retryDelayMs * (attempt + 1), context.signal);
      }
    }
    throw lastError ?? new ProviderError('OPENAI_UNAVAILABLE', 'OpenAI provider failed.', true);
  }

  async executeContext(context: HydratedContext, execution: ProviderExecutionContext): Promise<ProviderResponse> {
    return this.execute({
      prompt: context.sections.finalPayload,
      systemPrompt: context.sections.systemPrompt,
    }, execution);
  }

  private async request(payload: ReturnType<OpenAIMapper['toRequest']>, context: ProviderExecutionContext): Promise<ProviderResponse> {
    const controller = new AbortController();
    const cancel = () => controller.abort();
    context.signal?.addEventListener('abort', cancel, { once: true });
    const timeout = setTimeout(() => controller.abort(), this.configuration.timeoutMs);
    const startedAt = Date.now();
    try {
      const response = await this.configuration.fetcher(`${this.configuration.baseUrl}/responses`, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${this.configuration.apiKey}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      if (!response.ok) {
        let body: unknown;
        try {
          body = await response.json();
        } catch {
          body = await response.text().catch(() => undefined);
        }
        throw this.errors.fromHttp(response.status, body);
      }
      let body: unknown;
      try {
        body = await response.json();
      } catch {
        throw new ProviderError('OPENAI_INVALID_RESPONSE', 'OpenAI returned invalid JSON.');
      }
      return this.parser.parse(body, context.requestId, Date.now() - startedAt);
    } catch (error) {
      if (context.signal?.aborted) {
        throw new ProviderError('OPENAI_CANCELLED', 'OpenAI request was cancelled.');
      }
      if (error instanceof ProviderError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ProviderError('PROVIDER_TIMEOUT', `OpenAI request timed out after ${this.configuration.timeoutMs}ms.`, true);
      }
      throw this.errors.fromNetwork(error);
    } finally {
      clearTimeout(timeout);
      context.signal?.removeEventListener('abort', cancel);
    }
  }

  private canRetry(error: ProviderError, attempt: number): boolean {
    const retryableCode = error.code === 'OPENAI_RATE_LIMIT'
      || error.code === 'OPENAI_UNAVAILABLE';
    return retryableCode && attempt < this.configuration.maxRetries;
  }

  private wait(milliseconds: number, signal?: AbortSignal): Promise<void> {
    if (milliseconds <= 0) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, milliseconds);
      const cancel = () => {
        clearTimeout(timer);
        reject(new ProviderError('OPENAI_CANCELLED', 'OpenAI request was cancelled.'));
      };
      if (signal?.aborted) cancel();
      else signal?.addEventListener('abort', cancel, { once: true });
    });
  }
}

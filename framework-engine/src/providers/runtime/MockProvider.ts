import { ProviderError } from './ProviderErrors.ts';
import type { ProviderExecutionContext, ProviderRequest } from './ProviderRequest.ts';
import type { ProviderCapabilities, ProviderConfiguration, ProviderPort } from './ProviderPort.ts';
import type { ProviderResponse } from './ProviderResponse.ts';

export interface MockProviderOptions {
  latencyMs?: number;
  response?: string;
  failure?: string;
  maxPromptSize?: number;
}

export class MockProvider implements ProviderPort {
  readonly id: string;
  readonly configuration: ProviderConfiguration;
  private readonly options: MockProviderOptions;

  constructor(configuration: ProviderConfiguration = { id: 'mock', type: 'mock' }) {
    this.id = configuration.id;
    this.configuration = configuration;
    this.options = {
      ...(configuration.options as MockProviderOptions | undefined),
    };
  }

  capabilities(): ProviderCapabilities {
    return { streaming: false, supportsTemperature: true, supportsMaxTokens: true };
  }

  async execute(request: ProviderRequest, context: ProviderExecutionContext): Promise<ProviderResponse> {
    this.validate(request);
    await this.delay(this.options.latencyMs ?? 0, context.signal);
    if (this.options.failure) {
      throw new ProviderError('PROVIDER_FAILURE', this.options.failure);
    }

    const content = this.options.response ?? `[MockProvider] Response generated for ${request.prompt.length} characters.`;
    const promptTokens = this.estimateTokens(request.prompt);
    const completionTokens = this.estimateTokens(content);
    return {
      content,
      provider: this.id,
      requestId: context.requestId,
      model: request.model,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
    };
  }

  private validate(request: ProviderRequest): void {
    if (!request.prompt || !request.prompt.trim()) {
      throw new ProviderError('INVALID_PAYLOAD', 'Provider prompt cannot be empty.');
    }
    const maxPromptSize = this.options.maxPromptSize;
    if (maxPromptSize !== undefined && request.prompt.length > maxPromptSize) {
      throw new ProviderError('INVALID_PAYLOAD', `Provider prompt exceeds ${maxPromptSize} characters.`);
    }
  }

  private delay(milliseconds: number, signal?: AbortSignal): Promise<void> {
    if (milliseconds <= 0) {
      if (signal?.aborted) {
        return Promise.reject(new ProviderError('PROVIDER_CANCELLED', 'Provider execution was cancelled.'));
      }
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      const timer = setTimeout(resolve, milliseconds);
      const cancel = () => {
        clearTimeout(timer);
        reject(new ProviderError('PROVIDER_CANCELLED', 'Provider execution was cancelled.'));
      };
      if (signal?.aborted) {
        cancel();
      } else {
        signal?.addEventListener('abort', cancel, { once: true });
      }
    });
  }

  private estimateTokens(value: string): number {
    return Math.max(1, Math.ceil(value.length / 4));
  }
}

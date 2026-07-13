import { ProviderError } from '../runtime/ProviderErrors.ts';

export class AnthropicErrorMapper {
  fromHttp(status: number, body: unknown): ProviderError {
    const message = this.messageFrom(body) ?? `Anthropic request failed with HTTP ${status}.`;
    if (status === 429 || status >= 500) {
      return new ProviderError('PROVIDER_FAILURE', message, true);
    }
    if (status === 408) {
      return new ProviderError('PROVIDER_TIMEOUT', message);
    }
    return new ProviderError('PROVIDER_FAILURE', message);
  }

  fromNetwork(error: unknown): ProviderError {
    return new ProviderError(
      'PROVIDER_FAILURE',
      error instanceof Error ? error.message : 'Anthropic provider is unavailable.',
      true,
    );
  }

  invalidResponse(message = 'Anthropic response did not contain generated text.'): ProviderError {
    return new ProviderError('PROVIDER_FAILURE', message);
  }

  private messageFrom(body: unknown): string | undefined {
    if (typeof body === 'string' && body.trim()) return body;
    if (body && typeof body === 'object' && 'error' in body) {
      const error = body.error;
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return error.message;
      }
    }
    return undefined;
  }
}

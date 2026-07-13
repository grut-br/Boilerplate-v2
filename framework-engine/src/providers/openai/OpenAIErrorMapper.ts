import { ProviderError } from '../runtime/ProviderErrors.ts';

export class OpenAIErrorMapper {
  fromHttp(status: number, body: unknown): ProviderError {
    const message = this.messageFrom(body) ?? `OpenAI request failed with HTTP ${status}.`;
    if (status === 408) {
      return new ProviderError('PROVIDER_TIMEOUT', message, true);
    }
    if (status === 429) {
      return new ProviderError('OPENAI_RATE_LIMIT', message, true);
    }
    if (status >= 500) {
      return new ProviderError('OPENAI_UNAVAILABLE', message, true);
    }
    return new ProviderError('OPENAI_HTTP_ERROR', message);
  }

  fromNetwork(error: unknown): ProviderError {
    return new ProviderError(
      'OPENAI_UNAVAILABLE',
      error instanceof Error ? error.message : 'OpenAI provider is unavailable.',
      true,
    );
  }

  private messageFrom(body: unknown): string | undefined {
    if (typeof body === 'string' && body.trim()) {
      return body;
    }
    if (body && typeof body === 'object' && 'error' in body) {
      const error = body.error;
      if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return error.message;
      }
    }
    return undefined;
  }
}

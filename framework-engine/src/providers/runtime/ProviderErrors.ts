export type ProviderErrorCode =
  | 'PROVIDER_NOT_FOUND'
  | 'PROVIDER_REGISTRY_DUPLICATE'
  | 'INVALID_PROVIDER_CONFIGURATION'
  | 'INVALID_PAYLOAD'
  | 'PROVIDER_FAILURE'
  | 'PROVIDER_TIMEOUT'
  | 'PROVIDER_CANCELLED'
  | 'OPENAI_API_KEY_MISSING'
  | 'OPENAI_RATE_LIMIT'
  | 'OPENAI_UNAVAILABLE'
  | 'OPENAI_INVALID_RESPONSE'
  | 'OPENAI_HTTP_ERROR'
  | 'OPENAI_CANCELLED';

export class ProviderError extends Error {
  readonly code: ProviderErrorCode;
  readonly retryable: boolean;

  constructor(code: ProviderErrorCode, message: string, retryable = false) {
    super(message);
    this.name = 'ProviderError';
    this.code = code;
    this.retryable = retryable;
  }
}

export function isProviderError(error: unknown): error is ProviderError {
  return error instanceof ProviderError;
}

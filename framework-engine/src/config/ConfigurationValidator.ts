import { ConfigurationError } from './ConfigurationErrors.ts';
import type { EngineConfiguration } from './EngineConfiguration.ts';

export function validateConfiguration(configuration: EngineConfiguration): EngineConfiguration {
  const openai = configuration.openai;
  if (!openai || typeof openai !== 'object' || typeof openai.model !== 'string' || typeof openai.baseUrl !== 'string' || !openai.model.trim() || !openai.baseUrl.trim()) {
    throw new ConfigurationError('INVALID_CONFIGURATION', 'OpenAI model and baseUrl are required.');
  }
  if (!Number.isFinite(openai.timeout) || openai.timeout <= 0) {
    throw new ConfigurationError('INVALID_CONFIGURATION', 'OpenAI timeout must be positive.', { field: 'openai.timeout' });
  }
  if (!Number.isFinite(openai.maxOutputTokens) || openai.maxOutputTokens <= 0) {
    throw new ConfigurationError('INVALID_CONFIGURATION', 'OpenAI maxOutputTokens must be positive.', { field: 'openai.maxOutputTokens' });
  }
  if (!Number.isFinite(openai.temperature) || openai.temperature < 0 || openai.temperature > 2) {
    throw new ConfigurationError('INVALID_CONFIGURATION', 'OpenAI temperature must be between 0 and 2.', { field: 'openai.temperature' });
  }
  if (!Number.isInteger(openai.maxRetries) || openai.maxRetries < 0 || openai.retryDelayMs < 0) {
    throw new ConfigurationError('INVALID_CONFIGURATION', 'Retry configuration is invalid.', { field: 'openai.maxRetries' });
  }
  if (!['silent', 'error', 'warn', 'info', 'debug'].includes(configuration.logLevel)) {
    throw new ConfigurationError('INVALID_CONFIGURATION', 'Engine logLevel is invalid.', { field: 'logLevel' });
  }
  if (typeof configuration.debug !== 'boolean' || typeof configuration.cache !== 'boolean') {
    throw new ConfigurationError('INVALID_CONFIGURATION', 'Engine debug and cache must be boolean values.');
  }
  return configuration;
}

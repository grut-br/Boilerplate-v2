import { OpenAIProvider } from './OpenAIProvider.ts';
import { OpenAIConfiguration, type OpenAIConfigurationOptions } from './OpenAIConfiguration.ts';
import type { ProviderRegistry } from '../runtime/ProviderRegistry.ts';
import type { EngineConfiguration } from '../../config/EngineConfiguration.ts';

export function registerOpenAIProvider(
  registry: ProviderRegistry,
  configuration: OpenAIConfigurationOptions | OpenAIConfiguration | EngineConfiguration = {},
): OpenAIProvider {
  const provider = new OpenAIProvider(isEngineConfiguration(configuration)
    ? {
        apiKey: configuration.openai.apiKey,
        baseUrl: configuration.openai.baseUrl,
        model: configuration.openai.model,
        timeoutMs: configuration.openai.timeout,
        maxOutputTokens: configuration.openai.maxOutputTokens,
        temperature: configuration.openai.temperature,
        maxRetries: configuration.openai.maxRetries,
        retryDelayMs: configuration.openai.retryDelayMs,
      }
    : configuration);
  registry.register(provider);
  return provider;
}

function isEngineConfiguration(
  configuration: OpenAIConfigurationOptions | OpenAIConfiguration | EngineConfiguration,
): configuration is EngineConfiguration {
  return 'openai' in configuration;
}

export { OpenAIConfiguration } from './OpenAIConfiguration.ts';
export type { OpenAIConfigurationOptions, OpenAIFetch } from './OpenAIConfiguration.ts';
export { OpenAIErrorMapper } from './OpenAIErrorMapper.ts';
export { OpenAIMapper } from './OpenAIMapper.ts';
export type { OpenAIResponsesRequest } from './OpenAIMapper.ts';
export { OpenAIProvider } from './OpenAIProvider.ts';
export { OpenAIResponseParser } from './OpenAIResponseParser.ts';

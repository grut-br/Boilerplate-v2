import { AnthropicProvider } from './AnthropicProvider.ts';
import { AnthropicConfiguration, type AnthropicConfigurationOptions } from './AnthropicConfiguration.ts';
import type { ProviderRegistry } from '../runtime/ProviderRegistry.ts';

export function registerAnthropicProvider(
  registry: ProviderRegistry,
  configuration: AnthropicConfigurationOptions | AnthropicConfiguration = {},
): AnthropicProvider {
  const provider = new AnthropicProvider(configuration);
  registry.register(provider);
  return provider;
}

export { AnthropicConfiguration } from './AnthropicConfiguration.ts';
export type { AnthropicConfigurationOptions, AnthropicFetch } from './AnthropicConfiguration.ts';
export { AnthropicErrorMapper } from './AnthropicErrorMapper.ts';
export { AnthropicMapper } from './AnthropicMapper.ts';
export type { AnthropicMessagesRequest } from './AnthropicMapper.ts';
export { AnthropicProvider } from './AnthropicProvider.ts';
export { AnthropicResponseParser } from './AnthropicResponseParser.ts';

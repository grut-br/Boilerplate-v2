import { GeminiProvider } from './GeminiProvider.ts';
import { GeminiConfiguration, type GeminiConfigurationOptions } from './GeminiConfiguration.ts';
import type { ProviderRegistry } from '../runtime/ProviderRegistry.ts';

export function registerGeminiProvider(
  registry: ProviderRegistry,
  configuration: GeminiConfigurationOptions | GeminiConfiguration = {},
): GeminiProvider {
  const provider = new GeminiProvider(configuration);
  registry.register(provider);
  return provider;
}

export { GeminiConfiguration } from './GeminiConfiguration.ts';
export type { GeminiConfigurationOptions, GeminiFetch } from './GeminiConfiguration.ts';
export { GeminiErrorMapper } from './GeminiErrorMapper.ts';
export { GeminiMapper } from './GeminiMapper.ts';
export type { GeminiGenerateContentRequest } from './GeminiMapper.ts';
export { GeminiProvider } from './GeminiProvider.ts';
export { GeminiResponseParser } from './GeminiResponseParser.ts';

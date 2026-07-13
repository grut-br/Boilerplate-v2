import { ProviderError } from './ProviderErrors.ts';
import { MockProvider } from './MockProvider.ts';
import type { ProviderConfiguration, ProviderPort } from './ProviderPort.ts';

export type ProviderCreator = (configuration: ProviderConfiguration) => ProviderPort;

export class ProviderFactory {
  private readonly creators = new Map<string, ProviderCreator>();

  constructor() {
    this.register('mock', (configuration) => new MockProvider(configuration));
  }

  register(type: string, creator: ProviderCreator): this {
    this.creators.set(type, creator);
    return this;
  }

  create(configuration: ProviderConfiguration): ProviderPort {
    if (!configuration.id || !configuration.type) {
      throw new ProviderError('INVALID_PROVIDER_CONFIGURATION', 'Provider id and type are required.');
    }
    const creator = this.creators.get(configuration.type);
    if (!creator) {
      throw new ProviderError('INVALID_PROVIDER_CONFIGURATION', `No provider factory registered for: ${configuration.type}`);
    }
    return creator(configuration);
  }
}

import { ProviderError } from './ProviderErrors.ts';
import type { ProviderPort } from './ProviderPort.ts';

export class ProviderRegistry {
  private readonly providers = new Map<string, ProviderPort>();
  private defaultProviderId?: string;

  register(provider: ProviderPort): this {
    if (this.providers.has(provider.id)) {
      throw new ProviderError('PROVIDER_REGISTRY_DUPLICATE', `Provider already registered: ${provider.id}`);
    }
    this.providers.set(provider.id, provider);
    return this;
  }

  get(id: string): ProviderPort {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new ProviderError('PROVIDER_NOT_FOUND', `Provider not found: ${id}`);
    }
    return provider;
  }

  resolve(id?: string): ProviderPort {
    const providerId = id ?? this.defaultProviderId;
    if (!providerId) {
      throw new ProviderError('PROVIDER_NOT_FOUND', 'No provider was selected or configured.');
    }
    return this.get(providerId);
  }

  setDefault(id: string): this {
    this.get(id);
    this.defaultProviderId = id;
    return this;
  }

  getDefault(): ProviderPort | undefined {
    return this.defaultProviderId ? this.providers.get(this.defaultProviderId) : undefined;
  }

  list(): ProviderPort[] {
    return [...this.providers.values()];
  }

  has(id: string): boolean {
    return this.providers.has(id);
  }
}

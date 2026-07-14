import type { KnowledgeProvider } from '../contracts/KnowledgeProvider.ts';
import { ProviderAlreadyRegistered, ProviderNotFound } from './KnowledgeRuntimeErrors.ts';

export class KnowledgeProviderRegistry {
  private readonly providers = new Map<string, KnowledgeProvider>();

  register(provider: KnowledgeProvider): this {
    if (this.providers.has(provider.id)) {
      throw new ProviderAlreadyRegistered(provider.id);
    }
    this.providers.set(provider.id, provider);
    return this;
  }

  unregister(id: string): boolean {
    if (!this.providers.has(id)) {
      return false;
    }
    this.providers.delete(id);
    return true;
  }

  get(id: string): KnowledgeProvider {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new ProviderNotFound(id);
    }
    return provider;
  }

  has(id: string): boolean {
    return this.providers.has(id);
  }

  list(): KnowledgeProvider[] {
    return Array.from(this.providers.values());
  }

  clear(): void {
    this.providers.clear();
  }
}

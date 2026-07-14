import type { KnowledgeProvider } from '../contracts/KnowledgeProvider.ts';
import type { KnowledgeConfiguration } from '../KnowledgeConfiguration.ts';
import { ProviderNotFound } from './KnowledgeRuntimeErrors.ts';
import { MarkdownKnowledgeProvider } from '../providers/markdown/MarkdownKnowledgeProvider.ts';
import { GraphifyKnowledgeProvider } from '../providers/graphify/GraphifyKnowledgeProvider.ts';

export type KnowledgeProviderCreator = (config: KnowledgeConfiguration) => KnowledgeProvider;

export class KnowledgeProviderFactory {
  private readonly creators = new Map<string, KnowledgeProviderCreator>();

  constructor() {
    this.register('markdown', (config) => new MarkdownKnowledgeProvider(config as any));
    this.register('graphify', (config) => new GraphifyKnowledgeProvider(config as any));
  }

  register(type: string, creator: KnowledgeProviderCreator): this {
    this.creators.set(type, creator);
    return this;
  }

  create(type: string, config: KnowledgeConfiguration): KnowledgeProvider {
    const creator = this.creators.get(type);
    if (!creator) {
      throw new ProviderNotFound(type);
    }
    return creator(config);
  }

  has(type: string): boolean {
    return this.creators.has(type);
  }

  clear(): void {
    this.creators.clear();
  }
}

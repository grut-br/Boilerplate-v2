import type { KnowledgeProvider } from '../contracts/KnowledgeProvider.ts';
import type { KnowledgeRequest } from '../contracts/KnowledgeRequest.ts';
import type { KnowledgeResult } from '../contracts/KnowledgeResult.ts';
import type { KnowledgeProviderRegistry } from './KnowledgeProviderRegistry.ts';
import { KnowledgeProviderMetrics } from './KnowledgeProviderMetrics.ts';
import { ProviderExecutionError } from './KnowledgeRuntimeErrors.ts';

export class KnowledgeProviderExecutor {
  private readonly registry?: KnowledgeProviderRegistry;
  private readonly metrics: KnowledgeProviderMetrics;

  constructor(registry?: KnowledgeProviderRegistry, metrics?: KnowledgeProviderMetrics) {
    this.registry = registry;
    this.metrics = metrics ?? new KnowledgeProviderMetrics();
  }

  async execute(providerOrId: KnowledgeProvider | string, request: KnowledgeRequest): Promise<KnowledgeResult> {
    const startedAt = Date.now();
    let provider: KnowledgeProvider;

    if (typeof providerOrId === 'string') {
      if (!this.registry) {
        throw new Error('Registry is required to resolve provider by ID.');
      }
      provider = this.registry.get(providerOrId);
    } else {
      provider = providerOrId;
    }

    try {
      const result = await provider.query(request);
      const duration = Date.now() - startedAt;

      const finalResult: KnowledgeResult = {
        ...result,
        duration: typeof result.duration === 'number' ? result.duration : duration,
      };

      this.metrics.record({
        provider: provider.id,
        duration: finalResult.duration,
        documents: finalResult.documents?.length ?? 0,
        nodes: finalResult.nodes?.length ?? 0,
        cacheHit: !!finalResult.metadata?.cacheHit,
        success: true,
      });

      return finalResult;
    } catch (error) {
      const duration = Date.now() - startedAt;
      this.metrics.record({
        provider: provider.id,
        duration,
        documents: 0,
        nodes: 0,
        cacheHit: false,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });

      throw new ProviderExecutionError(
        provider.id,
        error instanceof Error ? error.message : String(error),
        error
      );
    }
  }

  getMetrics(): KnowledgeProviderMetrics {
    return this.metrics;
  }
}

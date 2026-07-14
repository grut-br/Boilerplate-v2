import type { KnowledgeResult } from '../contracts/KnowledgeResult.ts';
import { KnowledgeResolverMetrics } from './KnowledgeResolverMetrics.ts';
import { DefaultResolutionStrategy, type KnowledgeResolutionStrategy } from './KnowledgeResolutionStrategy.ts';
import { KnowledgeResolutionError } from './KnowledgeResolverErrors.ts';

export class KnowledgeResolver {
  private readonly metrics: KnowledgeResolverMetrics;
  private strategy: KnowledgeResolutionStrategy;

  constructor(strategy?: KnowledgeResolutionStrategy, metrics?: KnowledgeResolverMetrics) {
    this.strategy = strategy ?? new DefaultResolutionStrategy();
    this.metrics = metrics ?? new KnowledgeResolverMetrics();
  }

  setStrategy(strategy: KnowledgeResolutionStrategy): this {
    this.strategy = strategy;
    return this;
  }

  resolve(result: KnowledgeResult, providerPriority = 1): KnowledgeResult {
    const startedAt = Date.now();
    const docsReceived = result.documents?.length ?? 0;

    let filterTime = 0;
    let rankingTime = 0;

    try {
      const startRankingFilter = Date.now();
      
      const resolved = this.strategy.resolve(result, { providerPriority });
      
      const elapsed = Date.now() - startRankingFilter;
      filterTime = Math.ceil(elapsed * 0.4);
      rankingTime = Math.ceil(elapsed * 0.6);

      const docsSelected = resolved.documents?.length ?? 0;
      const docsDiscarded = docsReceived - docsSelected;
      const executionTime = Date.now() - startedAt;

      this.metrics.record({
        documentsReceived: docsReceived,
        documentsSelected: docsSelected,
        documentsDiscarded: docsDiscarded,
        executionTime,
        rankingTime,
        filterTime,
      });

      return resolved;
    } catch (error) {
      throw new KnowledgeResolutionError(
        error instanceof Error ? error.message : String(error)
      );
    }
  }

  getMetrics(): KnowledgeResolverMetrics {
    return this.metrics;
  }
}

import type { KnowledgeResult } from '../contracts/KnowledgeResult.ts';
import { KnowledgeFilter } from './KnowledgeFilter.ts';
import { KnowledgeRanking } from './KnowledgeRanking.ts';

export interface ResolutionContext {
  providerPriority: number;
}

export interface KnowledgeResolutionStrategy {
  readonly name: string;
  resolve(result: KnowledgeResult, context: ResolutionContext): KnowledgeResult;
}

export class DefaultResolutionStrategy implements KnowledgeResolutionStrategy {
  readonly name = 'default';

  private readonly filterOptions?: any;
  private readonly rankingOptions?: any;

  constructor(options?: { filter?: any; ranking?: any }) {
    this.filterOptions = options?.filter;
    this.rankingOptions = options?.ranking;
  }

  resolve(result: KnowledgeResult, context: ResolutionContext): KnowledgeResult {
    let documents = [...result.documents];

    if (this.filterOptions) {
      const filter = new KnowledgeFilter();
      documents = filter.filter(documents, this.filterOptions);
    }

    const rankingEngine = new KnowledgeRanking({
      providerId: this.rankingOptions?.providerId ?? 'markdown',
      providerPriority: context.providerPriority,
      targetType: this.rankingOptions?.targetType,
      targetMetadata: this.rankingOptions?.targetMetadata,
      targetTags: this.rankingOptions?.targetTags,
    });

    documents = rankingEngine.rank(
      documents,
      {
        providerId: this.rankingOptions?.providerId ?? 'markdown',
        providerPriority: context.providerPriority,
      },
      this.rankingOptions?.maxDocuments
    );

    return {
      ...result,
      documents,
    };
  }
}

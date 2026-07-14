import type { KnowledgeDocument } from '../contracts/KnowledgeDocument.ts';

export interface RankingContext {
  providerId: string;
  providerPriority: number;
}

export interface RankingCriterion {
  name: string;
  evaluate(doc: KnowledgeDocument, context: RankingContext): number;
}

export class ProviderPriorityCriterion implements RankingCriterion {
  readonly name = 'provider-priority';
  evaluate(doc: KnowledgeDocument, context: RankingContext): number {
    return context.providerPriority * 10;
  }
}

export class DocumentTypeCriterion implements RankingCriterion {
  readonly name = 'document-type';
  private readonly targetType?: string;

  constructor(targetType?: string) {
    this.targetType = targetType;
  }

  evaluate(doc: KnowledgeDocument): number {
    if (this.targetType && doc.metadata.type === this.targetType) {
      return 15;
    }
    return 0;
  }
}

export class MetadataCriterion implements RankingCriterion {
  readonly name = 'metadata-match';
  private readonly targetMetadata?: Record<string, any>;

  constructor(targetMetadata?: Record<string, any>) {
    this.targetMetadata = targetMetadata;
  }

  evaluate(doc: KnowledgeDocument): number {
    if (!this.targetMetadata) return 0;
    let score = 0;
    for (const [key, value] of Object.entries(this.targetMetadata)) {
      if (doc.metadata[key] === value) {
        score += 20;
      }
    }
    return score;
  }
}

export class TagsCriterion implements RankingCriterion {
  readonly name = 'tags-match';
  private readonly targetTags?: string[];

  constructor(targetTags?: string[]) {
    this.targetTags = targetTags;
  }

  evaluate(doc: KnowledgeDocument): number {
    if (!this.targetTags || this.targetTags.length === 0) return 0;
    let score = 0;
    const docTags = doc.metadata.tags || doc.metadata.keywords || [];
    if (Array.isArray(docTags)) {
      const lowerDocTags = docTags.map((t: any) => String(t).toLowerCase());
      for (const tag of this.targetTags) {
        if (lowerDocTags.includes(tag.toLowerCase())) {
          score += 25;
        }
      }
    }
    return score;
  }
}

export interface RankingOptions {
  providerId: string;
  providerPriority: number;
  targetType?: string;
  targetMetadata?: Record<string, any>;
  targetTags?: string[];
  maxDocuments?: number;
}

export class KnowledgeRanking {
  private readonly criteria: RankingCriterion[] = [];

  constructor(options: Omit<RankingOptions, 'maxDocuments'>) {
    this.criteria.push(new ProviderPriorityCriterion());
    if (options.targetType) {
      this.criteria.push(new DocumentTypeCriterion(options.targetType));
    }
    if (options.targetMetadata) {
      this.criteria.push(new MetadataCriterion(options.targetMetadata));
    }
    if (options.targetTags) {
      this.criteria.push(new TagsCriterion(options.targetTags));
    }
  }

  addCriterion(criterion: RankingCriterion): this {
    this.criteria.push(criterion);
    return this;
  }

  rank(documents: KnowledgeDocument[], context: RankingContext, maxDocuments?: number): KnowledgeDocument[] {
    const scored = documents.map(doc => {
      let totalScore = 0;
      for (const criterion of this.criteria) {
        totalScore += criterion.evaluate(doc, context);
      }
      return { doc, score: totalScore };
    });

    scored.sort((a, b) => b.score - a.score);

    const sortedDocs = scored.map(s => s.doc);

    if (typeof maxDocuments === 'number' && maxDocuments >= 0) {
      return sortedDocs.slice(0, maxDocuments);
    }

    return sortedDocs;
  }
}

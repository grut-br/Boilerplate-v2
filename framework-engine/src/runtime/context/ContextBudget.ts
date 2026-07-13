import { HydrationError } from './HydrationErrors.ts';
import type { ContextBudgetStats, HydratedDocument } from './types.ts';

export interface BudgetSelection {
  selected: HydratedDocument[];
  discarded: HydratedDocument[];
  statistics: ContextBudgetStats;
}

export class ContextBudget {
  readonly maxTokens: number;

  constructor(maxTokens = 8000) {
    if (!Number.isInteger(maxTokens) || maxTokens <= 0) {
      throw new HydrationError('CONTEXT_BUDGET_INVALID', 'Context budget must be a positive integer.', {
        maxTokens,
      });
    }
    this.maxTokens = maxTokens;
  }

  estimateTokens(content: string): number {
    return Math.max(1, Math.ceil(content.length / 4));
  }

  select(documents: HydratedDocument[]): BudgetSelection {
    const ordered = documents
      .map((document, index) => ({
        document: {
          ...document,
          estimatedTokens: document.estimatedTokens || this.estimateTokens(document.document.content),
        },
        index,
      }))
      .sort((left, right) => {
        if (left.document.required !== right.document.required) {
          return left.document.required ? -1 : 1;
        }
        return right.document.priority - left.document.priority || left.index - right.index;
      });

    const selected: HydratedDocument[] = [];
    const discarded: HydratedDocument[] = [];
    let usedTokens = 0;
    for (const item of ordered) {
      const document = item.document;
      if (document.required || usedTokens + document.estimatedTokens <= this.maxTokens) {
        selected.push(document);
        usedTokens += document.estimatedTokens;
      } else {
        discarded.push(document);
      }
    }

    const discardedTokens = discarded.reduce((total, document) => total + document.estimatedTokens, 0);
    return {
      selected,
      discarded,
      statistics: {
        maxTokens: this.maxTokens,
        usedTokens,
        discardedTokens,
        loadedDocuments: selected.length,
        discardedDocuments: discarded.length,
        requiredDocuments: selected.filter((document) => document.required).length,
        optionalDocuments: selected.filter((document) => !document.required).length,
      },
    };
  }
}

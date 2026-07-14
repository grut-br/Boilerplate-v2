import { KnowledgeAggregation } from './KnowledgeAggregation.ts';
import { KnowledgeSelection, type SelectionOptions } from './KnowledgeSelection.ts';
import { KnowledgePriority } from './KnowledgePriority.ts';
import type { KnowledgeResult } from '../contracts/KnowledgeResult.ts';

export class KnowledgeComposer {
  private readonly aggregation: KnowledgeAggregation;
  private readonly selection: KnowledgeSelection;
  private readonly priority: KnowledgePriority;

  constructor(priority?: KnowledgePriority, aggregation?: KnowledgeAggregation, selection?: KnowledgeSelection) {
    this.priority = priority ?? new KnowledgePriority();
    this.aggregation = aggregation ?? new KnowledgeAggregation(this.priority);
    this.selection = selection ?? new KnowledgeSelection();
  }

  compose(
    results: Array<{ providerId: string; result: KnowledgeResult }>,
    selectionOptions?: SelectionOptions
  ): KnowledgeResult {
    const merged = this.aggregation.merge(results);

    if (selectionOptions) {
      merged.documents = this.selection.selectDocuments(merged.documents, selectionOptions);
      merged.nodes = this.selection.selectNodes(merged.nodes, selectionOptions);
    }

    return merged;
  }

  getPrioritySystem(): KnowledgePriority {
    return this.priority;
  }
}

export interface KnowledgeResolverMetricEntry {
  documentsReceived: number;
  documentsSelected: number;
  documentsDiscarded: number;
  executionTime: number;
  rankingTime: number;
  filterTime: number;
  timestamp: number;
}

export class KnowledgeResolverMetrics {
  private readonly entries: KnowledgeResolverMetricEntry[] = [];

  record(entry: Omit<KnowledgeResolverMetricEntry, 'timestamp'>): KnowledgeResolverMetricEntry {
    const fullEntry: KnowledgeResolverMetricEntry = {
      ...entry,
      timestamp: Date.now(),
    };
    this.entries.push(fullEntry);
    return fullEntry;
  }

  getEntries(): KnowledgeResolverMetricEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries.length = 0;
  }
}

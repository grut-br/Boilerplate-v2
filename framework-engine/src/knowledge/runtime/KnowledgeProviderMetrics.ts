export interface KnowledgeProviderMetricEntry {
  provider: string;
  duration: number;
  documents: number;
  nodes: number;
  cacheHit: boolean;
  timestamp: number;
  success: boolean;
  error?: string;
}

export class KnowledgeProviderMetrics {
  private readonly entries: KnowledgeProviderMetricEntry[] = [];

  record(entry: Omit<KnowledgeProviderMetricEntry, 'timestamp'>): KnowledgeProviderMetricEntry {
    const fullEntry: KnowledgeProviderMetricEntry = {
      ...entry,
      timestamp: Date.now(),
    };
    this.entries.push(fullEntry);
    return fullEntry;
  }

  getEntries(): KnowledgeProviderMetricEntry[] {
    return [...this.entries];
  }

  getAverageDuration(providerId?: string): number {
    const filtered = providerId ? this.entries.filter(e => e.provider === providerId) : this.entries;
    if (filtered.length === 0) return 0;
    const total = filtered.reduce((acc, curr) => acc + curr.duration, 0);
    return total / filtered.length;
  }

  clear(): void {
    this.entries.length = 0;
  }
}

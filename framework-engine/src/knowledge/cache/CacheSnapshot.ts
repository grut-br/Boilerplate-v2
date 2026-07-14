import type { CacheEntry } from './CacheEntry.ts';
import type { CacheMetricsData } from './CacheMetrics.ts';

export interface CacheSnapshot {
  timestamp: number;
  entriesCount: number;
  entries: CacheEntry[];
  metrics: CacheMetricsData;
}

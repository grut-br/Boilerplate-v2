export interface CacheMetricsData {
  cacheHits: number;
  cacheMisses: number;
  evictions: number;
  memoryUsage: number;
  averageLookup: number;
  averageInsert: number;
  savedProviderCalls: number;
  savedTokensEstimated: number;
}

export class CacheMetrics {
  private cacheHits = 0;
  private cacheMisses = 0;
  private evictions = 0;
  private totalLookupTime = 0;
  private totalLookups = 0;
  private totalInsertTime = 0;
  private totalInserts = 0;
  private savedProviderCalls = 0;
  private savedTokensEstimated = 0;

  incrementHits(): void {
    this.cacheHits++;
    this.savedProviderCalls++;
  }

  incrementMisses(): void {
    this.cacheMisses++;
  }

  incrementEvictions(): void {
    this.evictions++;
  }

  recordLookup(duration: number): void {
    this.totalLookupTime += duration;
    this.totalLookups++;
  }

  recordInsert(duration: number, responseSize: number): void {
    this.totalInsertTime += duration;
    this.totalInserts++;
    
    const estimatedTokens = Math.ceil(responseSize / 4);
    this.savedTokensEstimated += estimatedTokens;
  }

  getMetrics(entriesCount: number): CacheMetricsData {
    const estimatedMemory = entriesCount * 2048;

    return {
      cacheHits: this.cacheHits,
      cacheMisses: this.cacheMisses,
      evictions: this.evictions,
      memoryUsage: estimatedMemory,
      averageLookup: this.totalLookups > 0 ? this.totalLookupTime / this.totalLookups : 0,
      averageInsert: this.totalInserts > 0 ? this.totalInsertTime / this.totalInserts : 0,
      savedProviderCalls: this.savedProviderCalls,
      savedTokensEstimated: this.cacheHits > 0 ? this.savedTokensEstimated : 0,
    };
  }

  clear(): void {
    this.cacheHits = 0;
    this.cacheMisses = 0;
    this.evictions = 0;
    this.totalLookupTime = 0;
    this.totalLookups = 0;
    this.totalInsertTime = 0;
    this.totalInserts = 0;
    this.savedProviderCalls = 0;
    this.savedTokensEstimated = 0;
  }
}

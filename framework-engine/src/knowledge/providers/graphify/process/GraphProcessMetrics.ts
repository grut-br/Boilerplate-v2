export interface GraphProcessMetricsData {
  syncDuration: number;
  filesSyncedCount: number;
  rebuildsCount: number;
  syncsAvoidedCount: number;
  queriesServedCount: number;
  cacheHitsCount: number;
}

export class GraphProcessMetrics {
  private syncDuration = 0;
  private filesSyncedCount = 0;
  private rebuildsCount = 0;
  private syncsAvoidedCount = 0;
  private queriesServedCount = 0;
  private cacheHitsCount = 0;

  recordSync(duration: number, filesCount: number): void {
    this.syncDuration += duration;
    this.filesSyncedCount += filesCount;
    this.rebuildsCount++;
  }

  incrementSyncsAvoided(): void {
    this.syncsAvoidedCount++;
  }

  incrementQueriesServed(): void {
    this.queriesServedCount++;
  }

  incrementCacheHits(): void {
    this.cacheHitsCount++;
  }

  getMetrics(): GraphProcessMetricsData {
    return {
      syncDuration: this.syncDuration,
      filesSyncedCount: this.filesSyncedCount,
      rebuildsCount: this.rebuildsCount,
      syncsAvoidedCount: this.syncsAvoidedCount,
      queriesServedCount: this.queriesServedCount,
      cacheHitsCount: this.cacheHitsCount,
    };
  }

  clear(): void {
    this.syncDuration = 0;
    this.filesSyncedCount = 0;
    this.rebuildsCount = 0;
    this.syncsAvoidedCount = 0;
    this.queriesServedCount = 0;
    this.cacheHitsCount = 0;
  }
}

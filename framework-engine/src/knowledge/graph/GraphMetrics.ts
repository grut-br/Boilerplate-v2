export interface GraphMetricsData {
  syncRequests: number;
  executedSyncs: number;
  dirtyFiles: number;
  averageSyncInterval: number;
  lastSyncDuration: number;
}

export class GraphMetrics {
  private syncRequests = 0;
  private executedSyncs = 0;
  private dirtyFiles = 0;
  private lastSyncDuration = 0;
  private readonly syncTimestamps: number[] = [];

  incrementSyncRequests(): void {
    this.syncRequests++;
  }

  incrementExecutedSyncs(duration: number): void {
    this.executedSyncs++;
    this.lastSyncDuration = duration;
    this.syncTimestamps.push(Date.now());
  }

  setDirtyFilesCount(count: number): void {
    this.dirtyFiles = count;
  }

  getAverageSyncInterval(): number {
    if (this.syncTimestamps.length < 2) {
      return 0;
    }
    let totalInterval = 0;
    for (let i = 1; i < this.syncTimestamps.length; i++) {
      totalInterval += this.syncTimestamps[i] - this.syncTimestamps[i - 1];
    }
    return totalInterval / (this.syncTimestamps.length - 1);
  }

  getMetrics(): GraphMetricsData {
    return {
      syncRequests: this.syncRequests,
      executedSyncs: this.executedSyncs,
      dirtyFiles: this.dirtyFiles,
      averageSyncInterval: this.getAverageSyncInterval(),
      lastSyncDuration: this.lastSyncDuration,
    };
  }

  clear(): void {
    this.syncRequests = 0;
    this.executedSyncs = 0;
    this.dirtyFiles = 0;
    this.lastSyncDuration = 0;
    this.syncTimestamps.length = 0;
  }
}

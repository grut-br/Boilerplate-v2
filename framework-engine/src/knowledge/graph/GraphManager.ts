import { GraphState } from './GraphState.ts';
import { DirtyTracker } from './DirtyTracker.ts';
import { LazySynchronization, type SyncPolicy } from './SyncPolicy.ts';
import { GraphMetrics } from './GraphMetrics.ts';
import type { GraphSnapshot } from './GraphSnapshot.ts';
import { GraphNotInitialized, InvalidGraphState } from './GraphErrors.ts';

export class GraphManager {
  private status: GraphState = GraphState.Uninitialized;
  private readonly dirtyTracker = new DirtyTracker();
  private readonly metrics = new GraphMetrics();
  private readonly policy: SyncPolicy;
  private lastSyncTimestamp = 0;
  private syncCount = 0;
  private readonly version = '1.0.0';

  constructor(policy?: SyncPolicy) {
    this.policy = policy ?? new LazySynchronization();
  }

  initialize(): void {
    if (this.status !== GraphState.Uninitialized) {
      return;
    }
    this.status = GraphState.Ready;
  }

  markDirty(filePath: string): void {
    this.ensureInitialized();
    this.dirtyTracker.mark(filePath);
    this.status = GraphState.Dirty;
    this.metrics.setDirtyFilesCount(this.dirtyTracker.getDirtyFiles().length);
  }

  requestSync(force = false): boolean {
    this.ensureInitialized();
    this.metrics.incrementSyncRequests();

    if (!this.dirtyTracker.isDirty()) {
      return false;
    }

    this.status = GraphState.SyncPending;

    if (force && this.policy instanceof LazySynchronization) {
      this.policy.requestSyncOnDemand();
    }

    if (this.policy.shouldSync(this.dirtyTracker)) {
      this.status = GraphState.Synchronizing;
      return true;
    }

    return false;
  }

  markSynced(duration = 0): void {
    this.ensureInitialized();
    if (this.status !== GraphState.Synchronizing && this.status !== GraphState.SyncPending) {
      throw new InvalidGraphState('graph-manager', this.status, 'Cannot mark synced when not in synchronizing or pending state.');
    }

    this.dirtyTracker.clearAll();
    this.status = GraphState.Synchronized;
    this.lastSyncTimestamp = Date.now();
    this.syncCount++;

    this.metrics.incrementExecutedSyncs(duration);
    this.metrics.setDirtyFilesCount(0);

    if (this.policy instanceof LazySynchronization) {
      this.policy.resetOnDemand();
    }
  }

  getState(): GraphState {
    return this.status;
  }

  snapshot(): GraphSnapshot {
    this.ensureInitialized();
    return {
      version: this.version,
      timestamp: Date.now(),
      dirtyFiles: this.dirtyTracker.getDirtyFiles(),
      lastSync: this.lastSyncTimestamp,
      syncCount: this.syncCount,
      status: this.status,
    };
  }

  getMetrics(): GraphMetrics {
    return this.metrics;
  }

  private ensureInitialized(): void {
    if (this.status === GraphState.Uninitialized) {
      throw new GraphNotInitialized();
    }
  }
}

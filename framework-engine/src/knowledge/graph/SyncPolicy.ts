import { DirtyTracker } from './DirtyTracker.ts';

export interface SyncPolicy {
  readonly name: string;
  shouldSync(dirtyTracker: DirtyTracker): boolean;
}

export class LazySynchronization implements SyncPolicy {
  readonly name = 'lazy';
  private syncOnDemandRequested = false;

  shouldSync(dirtyTracker: DirtyTracker): boolean {
    if (this.syncOnDemandRequested && dirtyTracker.isDirty()) {
      return true;
    }
    return false;
  }

  requestSyncOnDemand(): void {
    this.syncOnDemandRequested = true;
  }

  resetOnDemand(): void {
    this.syncOnDemandRequested = false;
  }
}

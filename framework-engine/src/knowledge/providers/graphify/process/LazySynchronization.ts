import { DirtyChecker } from './DirtyChecker.ts';
import { SynchronizationQueue } from './SynchronizationQueue.ts';

export class GraphifyLazySynchronization {
  private readonly dirtyChecker: DirtyChecker;
  private readonly queue: SynchronizationQueue;

  constructor(dirtyChecker: DirtyChecker, queue: SynchronizationQueue) {
    this.dirtyChecker = dirtyChecker;
    this.queue = queue;
  }

  onFileChanged(filePath: string, priority = 0): void {
    this.dirtyChecker.recordChange(filePath);
    this.queue.push(filePath, priority);
  }

  shouldSyncNow(): boolean {
    return !this.queue.isEmpty();
  }
}

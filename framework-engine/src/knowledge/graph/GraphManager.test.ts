import assert from 'node:assert/strict';
import test from 'node:test';
import { GraphManager } from './GraphManager.ts';
import { GraphState } from './GraphState.ts';
import { DirtyTracker } from './DirtyTracker.ts';
import { LazySynchronization } from './SyncPolicy.ts';
import { GraphNotInitialized, InvalidGraphState } from './GraphErrors.ts';

test('GraphManager Lifecycle and Initialization', () => {
  const manager = new GraphManager();
  assert.equal(manager.getState(), GraphState.Uninitialized);

  assert.throws(() => manager.markDirty('test.md'), GraphNotInitialized);

  manager.initialize();
  assert.equal(manager.getState(), GraphState.Ready);

  manager.initialize();
  assert.equal(manager.getState(), GraphState.Ready);
});

test('DirtyTracker and GraphManager tracking behaviors', () => {
  const tracker = new DirtyTracker();
  assert.equal(tracker.isDirty(), false);

  tracker.mark('file1.md');
  tracker.mark('file2.md');
  assert.equal(tracker.isDirty(), true);
  assert.deepEqual(tracker.getDirtyFiles(), ['file1.md', 'file2.md']);

  tracker.clear('file1.md');
  assert.deepEqual(tracker.getDirtyFiles(), ['file2.md']);

  tracker.clearAll();
  assert.equal(tracker.isDirty(), false);
});

test('GraphManager - State transitions and Lazy Policy Synchronization', () => {
  const manager = new GraphManager();
  manager.initialize();

  assert.equal(manager.getState(), GraphState.Ready);

  manager.markDirty('doc1.md');
  manager.markDirty('doc2.md');
  assert.equal(manager.getState(), GraphState.Dirty);

  const syncApproved1 = manager.requestSync();
  assert.equal(syncApproved1, false);
  assert.equal(manager.getState(), GraphState.SyncPending);

  const syncApproved2 = manager.requestSync(true);
  assert.equal(syncApproved2, true);
  assert.equal(manager.getState(), GraphState.Synchronizing);

  const invalidManager = new GraphManager();
  invalidManager.initialize();
  assert.throws(() => invalidManager.markSynced(10), InvalidGraphState);

  manager.markSynced(45);
  assert.equal(manager.getState(), GraphState.Synchronized);

  const snap = manager.snapshot();
  assert.equal(snap.version, '1.0.0');
  assert.equal(snap.syncCount, 1);
  assert.equal(snap.dirtyFiles.length, 0);
  assert.equal(snap.status, GraphState.Synchronized);
  assert.ok(snap.lastSync > 0);
});

test('GraphMetrics - tracking sync execution performance', () => {
  const manager = new GraphManager();
  manager.initialize();

  manager.markDirty('file.md');
  manager.requestSync();
  manager.requestSync();
  manager.markSynced(120);

  const metrics = manager.getMetrics().getMetrics();
  assert.equal(metrics.syncRequests, 2);
  assert.equal(metrics.executedSyncs, 1);
  assert.equal(metrics.dirtyFiles, 0);
  assert.equal(metrics.lastSyncDuration, 120);
});

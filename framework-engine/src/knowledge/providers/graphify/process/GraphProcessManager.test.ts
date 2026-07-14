import assert from 'node:assert/strict';
import test from 'node:test';
import { GraphProcessManager } from './GraphProcessManager.ts';
import { GraphProcessState } from './GraphProcessState.ts';
import { ProcessStartError, ProcessStopped } from './GraphProcessErrors.ts';
import { MockGraphWatcher } from './GraphWatcher.ts';

test('GraphProcessManager - startup, shutdown, restart, and automatic restart on fail', async () => {
  const manager = new GraphProcessManager({
    command: 'python -m graphify',
    args: ['--port', '8000'],
    autoRestart: true,
    maxRestarts: 3,
  });

  assert.equal(manager.status(), GraphProcessState.Uninitialized);

  await manager.start();
  assert.equal(manager.status(), GraphProcessState.Running);
  assert.ok(manager.health().processId === null || typeof manager.health().processId === 'number');

  await manager.restart();
  assert.equal(manager.status(), GraphProcessState.Running);

  await manager.stop();
  assert.equal(manager.status(), GraphProcessState.Stopped);
  assert.equal(manager.health().processId, null);

  const invalidManager = new GraphProcessManager({
    command: 'invalid-command',
    args: [],
    autoRestart: true,
    maxRestarts: 1,
  });

  await assert.rejects(async () => {
    await invalidManager.start();
  }, ProcessStartError);

  assert.equal(invalidManager.status(), GraphProcessState.Failed);

  const restarted = await invalidManager.restartIfNeeded();
  assert.equal(restarted, true);
  assert.equal(invalidManager.status(), GraphProcessState.Failed);

  await manager.shutdown();
  await invalidManager.shutdown();
});

test('DirtyChecker and SynchronizationQueue behavior', () => {
  const manager = new GraphProcessManager({
    command: 'python -m graphify',
    args: [],
    autoRestart: false,
    maxRestarts: 0,
  });

  const queue = manager.getQueue();

  queue.push('file1.md', 1);
  queue.push('file2.md', 10);
  queue.push('file1.md', 5);

  const items = queue.getItems();
  assert.equal(items.length, 2);
  assert.equal(items[0].id, 'file2.md');
  assert.equal(items[0].priority, 10);
  assert.equal(items[1].id, 'file1.md');
  assert.equal(items[1].priority, 5);

  queue.cancel('file2.md');
  assert.equal(queue.size(), 1);
  assert.equal(queue.pop()?.id, 'file1.md');
});

test('LazySynchronization and E2E simulation via mock GraphWatcher', async () => {
  const manager = new GraphProcessManager({
    command: 'python -m graphify',
    args: [],
    autoRestart: false,
    maxRestarts: 0,
  });

  await manager.start();

  (manager.getWatcher() as MockGraphWatcher).simulateFileChange('src/index.ts');
  (manager.getWatcher() as MockGraphWatcher).simulateFileChange('src/cli.ts');

  assert.equal(manager.status(), GraphProcessState.Dirty);
  assert.equal(manager.health().dirty, true);
  assert.equal(manager.health().pendingChanges, 2);
  assert.equal(manager.health().queuedChanges, 2);

  const syncExecuted = await manager.synchronize();
  assert.equal(syncExecuted, true);
  assert.equal(manager.status(), GraphProcessState.Idle);
  assert.equal(manager.health().dirty, false);
  assert.equal(manager.health().queuedChanges, 0);

  const metrics = manager.getMetrics().getMetrics();
  assert.equal(metrics.rebuildsCount, 1);
  assert.equal(metrics.filesSyncedCount, 2);

  const secondSync = await manager.synchronize();
  assert.equal(secondSync, false);
  assert.equal(manager.getMetrics().getMetrics().syncsAvoidedCount, 1);

  await manager.shutdown();
});

test('GraphProcessManager - throws when executing on stopped process', async () => {
  const manager = new GraphProcessManager({
    command: 'python -m graphify',
    args: [],
    autoRestart: false,
    maxRestarts: 0,
  });

  await manager.start();
  await manager.stop();

  await assert.rejects(async () => {
    await manager.synchronize();
  }, ProcessStopped);
});

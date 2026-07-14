import assert from 'node:assert/strict';
import test from 'node:test';
import { KnowledgeProviderRegistry } from './KnowledgeProviderRegistry.ts';
import { KnowledgeProviderFactory } from './KnowledgeProviderFactory.ts';
import { KnowledgeProviderExecutor } from './KnowledgeProviderExecutor.ts';
import { ProviderAlreadyRegistered, ProviderNotFound, ProviderExecutionError } from './KnowledgeRuntimeErrors.ts';
import type { KnowledgeProvider } from '../contracts/KnowledgeProvider.ts';
import type { KnowledgeRequest } from '../contracts/KnowledgeRequest.ts';
import type { KnowledgeResult } from '../contracts/KnowledgeResult.ts';
import type { KnowledgeConfiguration } from '../KnowledgeConfiguration.ts';

// Test Provedor Mock
class DummyKnowledgeProvider implements KnowledgeProvider {
  readonly id: string;
  readonly name: string;
  private readonly fail: boolean;

  constructor(id: string, name: string, fail = false) {
    this.id = id;
    this.name = name;
    this.fail = fail;
  }

  async query(request: KnowledgeRequest): Promise<KnowledgeResult> {
    if (this.fail) {
      throw new Error('Database connection failed');
    }
    return {
      documents: [{ id: 'doc1', path: 'file.md', content: 'hello', metadata: {} }],
      nodes: [{ id: 'node1', type: 'test', properties: {}, metadata: {} }],
      metadata: { cacheHit: true },
      diagnostics: {},
      duration: 15,
    };
  }
}

test('KnowledgeProviderRegistry - registration, duplicate prevention, removal', () => {
  const registry = new KnowledgeProviderRegistry();
  const provider1 = new DummyKnowledgeProvider('p1', 'Provider 1');
  const provider2 = new DummyKnowledgeProvider('p2', 'Provider 2');

  // Register
  registry.register(provider1);
  assert.equal(registry.has('p1'), true);
  assert.equal(registry.has('p2'), false);
  assert.equal(registry.get('p1'), provider1);

  // Duplication prevention
  assert.throws(() => registry.register(provider1), ProviderAlreadyRegistered);

  // Register second
  registry.register(provider2);
  assert.deepEqual(registry.list(), [provider1, provider2]);

  // Removal
  const removed = registry.unregister('p1');
  assert.equal(removed, true);
  assert.equal(registry.has('p1'), false);
  assert.equal(registry.unregister('p1'), false); // already removed
  assert.throws(() => registry.get('p1'), ProviderNotFound);

  // Clear
  registry.clear();
  assert.equal(registry.list().length, 0);
});

test('KnowledgeProviderFactory - contract-based registration and creation', () => {
  const factory = new KnowledgeProviderFactory();
  const mockConfig: KnowledgeConfiguration = {
    provider: new DummyKnowledgeProvider('p1', 'Provider 1'),
    workspace: '/test',
  };

  factory.register('dummy', (config) => new DummyKnowledgeProvider('p1', 'Provider 1'));

  assert.equal(factory.has('dummy'), true);
  assert.equal(factory.has('other'), false);

  const provider = factory.create('dummy', mockConfig);
  assert.equal(provider.id, 'p1');
  assert.equal(provider.name, 'Provider 1');

  assert.throws(() => factory.create('other', mockConfig), ProviderNotFound);

  factory.clear();
  assert.equal(factory.has('dummy'), false);
});

test('KnowledgeProviderExecutor - execution, metrics and controlled failure', async () => {
  const registry = new KnowledgeProviderRegistry();
  const provider = new DummyKnowledgeProvider('p1', 'Provider 1');
  const failingProvider = new DummyKnowledgeProvider('p2', 'Provider 2', true);

  registry.register(provider);
  registry.register(failingProvider);

  const executor = new KnowledgeProviderExecutor(registry);
  const request: KnowledgeRequest = { query: 'test', workspace: '/test' };

  // Successful execution
  const result = await executor.execute('p1', request);
  assert.equal(result.documents.length, 1);
  assert.equal(result.nodes.length, 1);
  assert.equal(result.duration, 15);

  const metrics = executor.getMetrics();
  const entries = metrics.getEntries();
  assert.equal(entries.length, 1);
  assert.equal(entries[0].provider, 'p1');
  assert.equal(entries[0].documents, 1);
  assert.equal(entries[0].nodes, 1);
  assert.equal(entries[0].cacheHit, true);
  assert.equal(entries[0].success, true);

  // Controlled failure execution
  await assert.rejects(
    async () => {
      await executor.execute('p2', request);
    },
    (err: any) => {
      return err instanceof ProviderExecutionError && err.providerId === 'p2';
    }
  );

  const updatedEntries = metrics.getEntries();
  assert.equal(updatedEntries.length, 2);
  assert.equal(updatedEntries[1].provider, 'p2');
  assert.equal(updatedEntries[1].success, false);
  assert.equal(updatedEntries[1].error, 'Database connection failed');

  // Execution of missing provider
  await assert.rejects(
    async () => {
      await executor.execute('non-existent', request);
    },
    ProviderNotFound
  );
});

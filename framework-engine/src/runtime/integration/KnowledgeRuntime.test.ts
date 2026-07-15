import { test, describe } from 'node:test';
import assert from 'node:assert';
import { RuntimeExecutor } from '../RuntimeExecutor.ts';
import { KnowledgeEngine } from '../../knowledge/KnowledgeEngine.ts';
import { KnowledgeRuntimeMapper } from './KnowledgeRuntimeMapper.ts';
import { KnowledgeRuntimeBridge } from './KnowledgeRuntimeBridge.ts';
import { InvalidKnowledgeRequest, KnowledgeResolutionFailed, KnowledgeTimeout } from './KnowledgeRuntimeErrors.ts';
import type { WorkUnit } from '../../workunit/WorkUnit.ts';
import type { KnowledgeProvider } from '../../knowledge/contracts/KnowledgeProvider.ts';

const mockProvider: KnowledgeProvider = {
  id: 'mock',
  name: 'Mock Knowledge Provider',
  initialize: async () => {},
  shutdown: async () => {},
  query: async (req) => {
    if (req.query.includes('timeout-trigger')) {
      const err = new Error('timeout error occurred');
      err.name = 'McpTimeout';
      throw err;
    }
    if (req.query.includes('fail-trigger')) {
      throw new Error('internal engine failure');
    }
    if (req.query.includes('empty-trigger')) {
      return { documents: [], nodes: [], metadata: { empty: true }, diagnostics: {}, duration: 0 };
    }
    return {
      documents: [{ id: 'doc-1', content: 'mock doc content', path: 'src/file.ts', score: 0.9, metadata: {} }],
      nodes: [{ id: 'node-1', label: 'Controller', properties: {}, type: 'file', metadata: {} }],
      metadata: { success: true },
      diagnostics: {},
      duration: 0
    };
  }
};

const sampleWorkUnit: WorkUnit = {
  id: 'wu-1',
  title: 'Test Work Unit',
  description: 'A test work unit for E2E validation.',
  objective: 'query-text: recuperar dados de configuracao',
  capability: 'semanticSearch',
  workflow: 'crud',
  priority: 'high',
  tags: ['auth', 'database'],
  status: 'pending',
  author: 'Developer',
  createdAt: new Date().toISOString(),
  rawContent: '',
  metadata: { priority: 'high' } as any,
  body: '',
  instructions: '',
  references: [],
  checklist: []
};

describe('KnowledgeRuntimeIntegration', () => {
  test('KnowledgeRuntimeMapper - maps WorkUnit to KnowledgeRequest correctly', () => {
    const request = KnowledgeRuntimeMapper.toRequest(sampleWorkUnit, '/workspace-root');

    assert.equal(request.query, 'query-text: recuperar dados de configuracao');
    assert.equal(request.workspace, '/workspace-root');
    assert.equal(request.capability, 'semanticSearch');
    assert.equal(request.filters?.workflow, 'crud');
    assert.equal(request.filters?.priority, 'high');
    assert.deepEqual(request.filters?.tags, ['auth', 'database']);
    assert.equal(request.metadata?.id, 'wu-1');
  });

  test('KnowledgeRuntimeMapper - throws on invalid input', () => {
    assert.throws(() => {
      KnowledgeRuntimeMapper.toRequest(null as any, '/workspace');
    }, InvalidKnowledgeRequest);

    assert.throws(() => {
      KnowledgeRuntimeMapper.toRequest(sampleWorkUnit, '');
    }, InvalidKnowledgeRequest);
  });

  test('KnowledgeRuntimeBridge & RuntimeExecutor - completes pipeline with mock engine', async () => {
    const engine = new KnowledgeEngine({
      provider: mockProvider,
      workspace: '/workspace-root'
    });
    await engine.initialize();

    const executor = new RuntimeExecutor(engine);
    const context = executor.initialize('/workspace-root');

    // Simula work unit carregada
    context.currentWorkUnit = sampleWorkUnit;

    const bridge = new KnowledgeRuntimeBridge(engine);
    await bridge.resolveKnowledge(context);

    assert.ok(context.knowledgeRequest);
    assert.ok(context.knowledgeResult);
    assert.equal(context.knowledgeResult.metadata.success, true);
    assert.equal(context.metrics.providerName, 'Mock Knowledge Provider');
    assert.equal(context.metrics.documentsResolved, 1);
    assert.equal(context.metrics.nodesResolved, 1);
    assert.ok(typeof context.metrics.knowledgeDuration === 'number');

    const snap = executor.snapshot();
    assert.ok(snap.knowledge);
    assert.equal(snap.knowledge.providerName, 'Mock Knowledge Provider');
    assert.ok(snap.knowledge.request);
    assert.equal(snap.knowledge.request.query, 'query-text: recuperar dados de configuracao');
  });

  test('KnowledgeRuntimeBridge - throws KnowledgeTimeout on timeout error', async () => {
    const engine = new KnowledgeEngine({
      provider: mockProvider,
      workspace: '/workspace-root'
    });
    await engine.initialize();

    const executor = new RuntimeExecutor(engine);
    const context = executor.initialize('/workspace-root');
    context.currentWorkUnit = {
      ...sampleWorkUnit,
      objective: 'timeout-trigger'
    };

    const bridge = new KnowledgeRuntimeBridge(engine);
    await assert.rejects(async () => {
      await bridge.resolveKnowledge(context);
    }, KnowledgeTimeout);
  });

  test('KnowledgeRuntimeBridge - throws KnowledgeResolutionFailed on internal error', async () => {
    const engine = new KnowledgeEngine({
      provider: mockProvider,
      workspace: '/workspace-root'
    });
    await engine.initialize();

    const executor = new RuntimeExecutor(engine);
    const context = executor.initialize('/workspace-root');
    context.currentWorkUnit = {
      ...sampleWorkUnit,
      objective: 'fail-trigger'
    };

    const bridge = new KnowledgeRuntimeBridge(engine);
    await assert.rejects(async () => {
      await bridge.resolveKnowledge(context);
    }, KnowledgeResolutionFailed);
  });

  test('KnowledgeRuntimeBridge - handles empty query response correctly', async () => {
    const engine = new KnowledgeEngine({
      provider: mockProvider,
      workspace: '/workspace-root'
    });
    await engine.initialize();

    const executor = new RuntimeExecutor(engine);
    const context = executor.initialize('/workspace-root');
    context.currentWorkUnit = {
      ...sampleWorkUnit,
      objective: 'empty-trigger'
    };

    const bridge = new KnowledgeRuntimeBridge(engine);
    await bridge.resolveKnowledge(context);

    assert.equal(context.metrics.documentsResolved, 0);
    assert.equal(context.metrics.nodesResolved, 0);
    assert.equal(context.knowledgeResult?.metadata.empty, true);
  });
});

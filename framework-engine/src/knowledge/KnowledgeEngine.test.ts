import assert from 'node:assert/strict';
import test from 'node:test';
import { KnowledgeEngine } from './KnowledgeEngine.ts';
import type { KnowledgeConfiguration } from './KnowledgeConfiguration.ts';
import type { KnowledgeProvider } from './contracts/KnowledgeProvider.ts';
import type { KnowledgeRequest } from './contracts/KnowledgeRequest.ts';
import type { KnowledgeResult } from './contracts/KnowledgeResult.ts';
import { KnowledgeNotInitialized } from './KnowledgeErrors.ts';

// Create a mock provider
class MockKnowledgeProvider implements KnowledgeProvider {
  readonly id = 'mock-provider';
  readonly name = 'Mock Provider';
  initialized = false;
  shutdownCalled = false;

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  async shutdown(): Promise<void> {
    this.shutdownCalled = true;
  }

  async query(request: KnowledgeRequest): Promise<KnowledgeResult> {
    return {
      documents: [],
      nodes: [],
      metadata: {},
      diagnostics: {},
      duration: 0,
    };
  }

  getStatus(): string {
    return this.initialized ? 'initialized' : 'idle';
  }
}

test('KnowledgeEngine Lifecycle and Context State', async () => {
  const provider = new MockKnowledgeProvider();
  const config: KnowledgeConfiguration = {
    debug: true,
    verbose: false,
    cache: true,
    provider,
    workspace: '/test/workspace',
  };

  const engine = new KnowledgeEngine(config);

  // Initial state checks
  assert.equal(engine.getStatus(), 'idle');
  assert.equal(engine.getVersion(), '4.0.0');
  assert.throws(() => engine.getContext(), KnowledgeNotInitialized);

  // Initialize
  await engine.initialize();
  assert.equal(engine.getStatus(), 'initialized');
  assert.equal(provider.initialized, true);
  assert.equal(provider.getStatus(), 'initialized');

  // Context verification
  const context = engine.getContext();
  assert.equal(context.status, 'initialized');
  assert.equal(context.configuration.workspace, '/test/workspace');
  assert.equal(context.configuration.debug, true);
  assert.equal(context.configuration.cache, true);
  assert.equal(context.queryCount, 0);

  // Shutdown
  await engine.shutdown();
  assert.equal(engine.getStatus(), 'shutdown');
  assert.equal(provider.shutdownCalled, true);
  assert.equal(context.status, 'shutdown');
});

test('KnowledgeEngine Query Integration with QueryPlanner', async () => {
  const provider = new MockKnowledgeProvider();
  const config: KnowledgeConfiguration = {
    provider,
    workspace: '/test/workspace',
    futureOptions: {
      planning: {
        policy: {
          maxCost: 200, // Permitido
        }
      }
    }
  };

  const engine = new KnowledgeEngine(config);
  await engine.initialize();

  const req: KnowledgeRequest = {
    query: 'Configure Postgres tables and next configure Supabase auth',
    workspace: '/test/workspace',
    capability: 'db',
  };

  const result = await engine.query(req);
  assert.ok(result.diagnostics.queryPlan);
  assert.equal(result.diagnostics.queryPlan.capabilities[0], 'db');
  assert.equal(result.diagnostics.queryPlan.providers[0], 'mock-provider');

  // Verifica que um limite na política causa erro na query
  const strictConfig: KnowledgeConfiguration = {
    provider,
    workspace: '/test/workspace',
    futureOptions: {
      planning: {
        policy: {
          maxCost: 5, // Muito baixo, causará violação
        }
      }
    }
  };

  const strictEngine = new KnowledgeEngine(strictConfig);
  await strictEngine.initialize();

  await assert.rejects(async () => {
    await strictEngine.query(req);
  }, /Planning policy "maxCost" violated/);

  await engine.shutdown();
  await strictEngine.shutdown();
});

class MockAstKnowledgeProvider implements KnowledgeProvider {
  readonly id = 'ast-provider';
  readonly name = 'AST Provider';

  async query(request: KnowledgeRequest): Promise<KnowledgeResult> {
    return {
      documents: [],
      nodes: [
        {
          id: 'node1',
          type: 'class',
          properties: {
            identifier: 'AppService',
            file: 'app.ts',
            children: ['node2'],
            references: ['node3'],
            priority: 100,
            weight: 50,
          },
          metadata: {},
        },
        {
          id: 'node2',
          type: 'method',
          properties: {
            identifier: 'run',
            file: 'app.ts',
            parent: 'node1',
            priority: 50,
            weight: 20,
          },
          metadata: {},
        },
        {
          id: 'node3',
          type: 'class',
          properties: {
            identifier: 'Database',
            file: 'db.ts',
            priority: 80,
            weight: 30,
          },
          metadata: {},
        }
      ],
      metadata: {},
      diagnostics: {},
      duration: 0,
    };
  }
}

test('KnowledgeEngine Query Integration with AST Projection', async () => {
  const provider = new MockAstKnowledgeProvider();
  const config: KnowledgeConfiguration = {
    provider,
    workspace: '/test/workspace',
    futureOptions: {
      astProjection: {
        policy: {
          maxNodes: 10,
        }
      }
    }
  };

  const engine = new KnowledgeEngine(config);
  await engine.initialize();

  const req: KnowledgeRequest = {
    query: 'Find class AppService',
    workspace: '/test/workspace',
    filters: {
      targetSymbol: 'AppService',
    }
  };

  const result = await engine.query(req);

  // Deve possuir o plano nos metadados/diagnostics e a projeção nos diagnostics
  assert.ok(result.diagnostics.astProjection);
  assert.equal(result.diagnostics.astProjection.metadata.targetSymbol, 'AppService');
  
  // Como usamos a DefaultProjectionStrategy, deve incluir AppService, seu filho run (node2) e a referência Database (node3)
  assert.equal(result.nodes.length, 3);
  assert.ok(result.nodes.some(n => n.id === 'node1'));
  assert.ok(result.nodes.some(n => n.id === 'node2'));
  assert.ok(result.nodes.some(n => n.id === 'node3'));

  // Testando violação de política
  const strictConfig: KnowledgeConfiguration = {
    provider,
    workspace: '/test/workspace',
    futureOptions: {
      astProjection: {
        policy: {
          maxDepth: 1, // Causará violação porque a profundidade da projeção é 2 (AppService -> run)
        }
      }
    }
  };

  const strictEngine = new KnowledgeEngine(strictConfig);
  await strictEngine.initialize();

  await assert.rejects(async () => {
    await strictEngine.query(req);
  }, /AST Projection policy "maxDepth" violated/);

  await engine.shutdown();
  await strictEngine.shutdown();
});

test('KnowledgeEngine Query Integration with Prompt Assembly V2', async () => {
  const provider = new MockAstKnowledgeProvider();
  const config: KnowledgeConfiguration = {
    provider,
    workspace: '/test/workspace',
    futureOptions: {
      promptAssembly: {
        budget: {
          maxTokens: 1000,
        }
      }
    }
  };

  const engine = new KnowledgeEngine(config);
  await engine.initialize();

  const req: KnowledgeRequest = {
    query: 'How to build auth flows?',
    workspace: '/test/workspace',
    capability: 'security',
  };

  const result = await engine.query(req);

  // Deve conter o prompt final gerado nos diagnósticos
  assert.ok(result.diagnostics.promptText);
  assert.ok(result.diagnostics.promptText.includes('How to build auth flows?'));
  assert.ok(result.diagnostics.promptText.includes('security'));
  
  // Deve conter estatísticas e snapshots
  assert.ok(result.diagnostics.promptSnapshot);
  assert.ok(result.diagnostics.promptMetrics);
  assert.ok(result.diagnostics.promptMetrics.tokensEstimados > 0);

  await engine.shutdown();
});

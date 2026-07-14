import assert from 'node:assert/strict';
import test from 'node:test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GraphifyKnowledgeProvider } from './GraphifyKnowledgeProvider.ts';
import type { GraphifyConfiguration } from './GraphifyConfiguration.ts';
import { GraphifyMapper } from './GraphifyMapper.ts';
import { isCapabilitySupported, GraphifyCapabilities } from './GraphifyCapabilities.ts';
import {
  GraphifyConfigurationError,
  UnsupportedCapability,
  GraphifyUnavailable,
  GraphifyNotConfigured
} from './GraphifyErrors.ts';
import { KnowledgeProviderFactory } from '../../runtime/KnowledgeProviderFactory.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('GraphifyKnowledgeProvider - Configuration Validation', () => {
  assert.throws(() => {
    new GraphifyKnowledgeProvider({
      enabled: true,
      workspaceRoot: '',
      graphLocation: 'graph.json',
      transport: 'stub',
    });
  }, GraphifyConfigurationError);

  assert.throws(() => {
    new GraphifyKnowledgeProvider({
      enabled: true,
      workspaceRoot: '/workspace',
      graphLocation: '',
      transport: 'stub',
    });
  }, GraphifyConfigurationError);

  assert.throws(() => {
    new GraphifyKnowledgeProvider({
      enabled: true,
      workspaceRoot: '/workspace',
      graphLocation: 'graph.json',
      transport: 'invalid' as any,
    });
  }, GraphifyConfigurationError);
});

test('GraphifyCapabilities - checking supported abilities', () => {
  assert.equal(isCapabilitySupported('semanticSearch'), true);
  assert.equal(isCapabilitySupported(GraphifyCapabilities.astLookup), true);
  assert.equal(isCapabilitySupported('unsupportedCapabilityXyz'), false);
});

test('GraphifyMapper - Request and Response translations', () => {
  const mapper = new GraphifyMapper();

  const kRequest = {
    query: 'test query',
    workspace: '/my-workspace',
    capability: 'semanticSearch',
    filters: { limit: 10 },
    metadata: { force: true },
  };

  const gRequest = mapper.toGraphifyRequest(kRequest, 3, 50);
  assert.equal(gRequest.query, 'test query');
  assert.equal(gRequest.workspaceRoot, '/my-workspace');
  assert.equal(gRequest.depth, 3);
  assert.equal(gRequest.limit, 50);
  assert.equal(gRequest.capability, 'semanticSearch');
  assert.equal(gRequest.filters?.limit, 10);
  assert.equal(gRequest.params?.force, true);

  const gResponse = {
    documents: [
      { id: 'd1', path: 'file.ts', content: 'code', metadata: { loc: 100 } }
    ],
    nodes: [
      { id: 'n1', type: 'Class', properties: { name: 'MyClass' }, metadata: { line: 12 } }
    ],
    metadata: { took: 5 },
    diagnostics: { engine: 'v4' },
    durationMs: 12,
  };

  const kResult = mapper.toKnowledgeResult(gResponse);
  assert.equal(kResult.documents.length, 1);
  assert.equal(kResult.documents[0].id, 'd1');
  assert.equal(kResult.documents[0].metadata.loc, 100);

  assert.equal(kResult.nodes.length, 1);
  assert.equal(kResult.nodes[0].id, 'n1');
  assert.equal(kResult.nodes[0].properties.name, 'MyClass');
  assert.equal(kResult.nodes[0].metadata.line, 12);

  assert.equal(kResult.duration, 12);
});

test('GraphifyKnowledgeProvider - E2E Stub Query and Health diagnostics', async () => {
  const config: GraphifyConfiguration = {
    enabled: true,
    workspaceRoot: '/workspace',
    graphLocation: 'graph.json',
    transport: 'stub',
    maxDepth: 3,
    maxNodes: 50,
    cacheEnabled: true,
  };

  const provider = new GraphifyKnowledgeProvider(config);
  
  const healthIdle = provider.getHealth();
  assert.equal(healthIdle.configured, true);
  assert.equal(healthIdle.enabled, true);
  assert.equal(healthIdle.reachable, false);

  await assert.rejects(async () => {
    await provider.query({ query: 'test', workspace: '/workspace' });
  }, GraphifyUnavailable);

  await provider.initialize();
  assert.equal(provider.getStatus(), 'initialized');

  const result = await provider.query({
    query: 'query-text',
    workspace: '/workspace',
    capability: 'semanticSearch',
  });

  assert.equal(result.documents.length, 1);
  assert.equal(result.documents[0].id, 'graphify-doc');
  assert.equal(result.documents[0].metadata.capabilityUsed, 'semanticSearch');
  assert.equal(result.nodes.length, 1);
  assert.equal(result.nodes[0].properties.name, 'GraphifyStub');

  const healthActive = provider.getHealth();
  assert.equal(healthActive.reachable, true);

  await provider.shutdown();
  assert.equal(provider.getStatus(), 'shutdown');
});

test('GraphifyKnowledgeProvider - Factory Automatic Registration', () => {
  const factory = new KnowledgeProviderFactory();
  assert.equal(factory.has('graphify'), true);

  const provider = factory.create('graphify', {
    enabled: true,
    workspaceRoot: '/workspace',
    graphLocation: 'graph.json',
    transport: 'stub',
  } as any);

  assert.equal(provider.id, 'graphify');
  assert.equal(provider.name, 'Graphify Knowledge Provider');
});

test('GraphifyKnowledgeProvider - Real Integration and Ghost State Protection', async () => {
  const tmpGraph = path.join(__dirname, 'tmp-graph.json');
  const config: GraphifyConfiguration = {
    enabled: true,
    workspaceRoot: __dirname,
    graphLocation: tmpGraph,
    transport: 'mcp',
    maxDepth: 3,
    maxNodes: 50,
  };

  const provider = new GraphifyKnowledgeProvider(config);
  await provider.initialize();

  // Garante que iniciou o subprocesso real
  const proc = provider.getProcessManager();
  assert.ok(proc);
  assert.equal(typeof proc.health().processId, 'number');

  // Enfileira sincronização de um arquivo de teste de forma simulada no watcher do processo
  proc.queueSynchronization(path.join(__dirname, 'AppController.ts'));
  assert.equal(proc.health().dirty, true);

  // Ghost State Protection & Lazy Sync:
  // Faz uma consulta que deve disparar a sincronização automática antes de ler o grafo
  const queryRes = await provider.query({
    query: 'AppController',
    workspace: __dirname,
  });

  // O arquivo graph.json deve ter sido atualizado no disco e a consulta deve trazer o nó correspondente
  assert.equal(proc.health().dirty, false);
  assert.ok(fs.existsSync(tmpGraph));

  // Verifica os nós retornados
  assert.ok(queryRes.nodes.length > 0);
  assert.ok(queryRes.nodes.some(n => n.properties.identifier === 'AppController'));

  // Métodos de conveniência/lookup
  const symbols = await provider.symbols();
  assert.ok(symbols.includes('AppController'));

  await provider.shutdown();
  
  // Limpa o arquivo temporário
  if (fs.existsSync(tmpGraph)) {
    fs.unlinkSync(tmpGraph);
  }
});

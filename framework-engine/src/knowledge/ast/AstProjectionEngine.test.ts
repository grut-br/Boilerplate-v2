/**
 * AstProjectionEngine.test.ts
 *
 * Testes unitários para a AST Projection Engine.
 * Cobre projeção, profundidade, dependências, colapso, expansão, poda, políticas, métricas e snapshots.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { AstProjectionEngine } from './AstProjectionEngine.ts';
import type { AstProjectionNode } from './AstProjectionNode.ts';
import {
  DefaultProjectionStrategy,
  MinimalProjectionStrategy,
  DependencyProjectionStrategy,
} from './AstProjectionStrategy.ts';
import { AstProjectionPolicyViolation, InvalidAstProjectionInput } from './AstProjectionErrors.ts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeNode(
  id: string,
  kind: string,
  identifier: string,
  file = 'source.ts',
  priority = 10,
  weight = 50,
  children: string[] = [],
  references: string[] = [],
  parent?: string
): AstProjectionNode {
  return {
    id,
    kind,
    identifier,
    file,
    range: { startLine: 1, startColumn: 1, endLine: 2, endColumn: 10 },
    priority,
    weight,
    children,
    references,
    parent,
    content: `// code for ${identifier}`,
  };
}

// ─── Testes ───────────────────────────────────────────────────────────────────

test('AstProjectionEngine: default options work', () => {
  const engine = new AstProjectionEngine();
  assert.equal(engine.getStrategy().name, 'default');
  assert.equal(engine.getPolicy().maxNodes, 100);
});

test('AstProjectionEngine: project using DefaultProjectionStrategy', () => {
  const engine = new AstProjectionEngine();
  
  const nodes: Record<string, AstProjectionNode> = {
    'root': makeNode('root', 'class', 'AppService', 'app.ts', 100, 100, ['child1'], ['ref1']),
    'child1': makeNode('child1', 'method', 'run', 'app.ts', 50, 50, [], [], 'root'),
    'ref1': makeNode('ref1', 'class', 'Database', 'db.ts', 80, 80, [], []),
  };

  const result = engine.project(nodes, 'AppService');

  // Deve incluir root, child1 e ref1
  assert.equal(Object.keys(result.projection.nodes).length, 3);
  assert.equal(result.projection.edges.length, 2); // 1 parent-child, 1 reference
  assert.equal(result.projection.depth, 2); // AppService -> run (child)
  assert.equal(result.metrics.nodesLoaded, 3);
  assert.equal(result.metrics.nodesDiscarded, 0);
  assert.equal(result.metrics.filesVisited, 2); // app.ts, db.ts
});

test('AstProjectionEngine: project using MinimalProjectionStrategy', () => {
  const engine = new AstProjectionEngine({
    strategy: new MinimalProjectionStrategy(),
  });

  const nodes: Record<string, AstProjectionNode> = {
    'root': makeNode('root', 'class', 'AppService', 'app.ts', 100, 100, ['child1'], ['ref1']),
    'child1': makeNode('child1', 'method', 'run', 'app.ts', 50, 50, [], [], 'root'),
    'ref1': makeNode('ref1', 'class', 'Database', 'db.ts', 80, 80, [], []),
  };

  const result = engine.project(nodes, 'AppService');

  // Deve conter apenas o nó AppService sem filhos nem referências
  assert.equal(Object.keys(result.projection.nodes).length, 1);
  assert.ok(result.projection.nodes['root']);
  assert.equal(result.projection.nodes['root'].children.length, 0);
  assert.equal(result.projection.nodes['root'].references.length, 0);
});

test('AstProjectionEngine: project using DependencyProjectionStrategy', () => {
  const engine = new AstProjectionEngine({
    strategy: new DependencyProjectionStrategy(2), // Max depth 2
  });

  const nodes: Record<string, AstProjectionNode> = {
    'root': makeNode('root', 'class', 'AppService', 'app.ts', 100, 100, [], ['ref1']),
    'ref1': makeNode('ref1', 'class', 'Database', 'db.ts', 80, 80, [], ['ref2']),
    'ref2': makeNode('ref2', 'class', 'Pool', 'pool.ts', 60, 60, [], ['ref3']),
    'ref3': makeNode('ref3', 'class', 'Socket', 'socket.ts', 40, 40, [], []), // Fica de fora (depth 3)
  };

  const result = engine.project(nodes, 'AppService');

  assert.equal(Object.keys(result.projection.nodes).length, 3); // root, ref1, ref2
  assert.ok(!result.projection.nodes['ref3']);
});

test('AstProjectionEngine: expand adds children/references', () => {
  const engine = new AstProjectionEngine({
    strategy: new MinimalProjectionStrategy(),
  });

  const nodes: Record<string, AstProjectionNode> = {
    'root': makeNode('root', 'class', 'AppService', 'app.ts', 100, 100, ['child1'], ['ref1']),
    'child1': makeNode('child1', 'method', 'run', 'app.ts', 50, 50, [], [], 'root'),
    'ref1': makeNode('ref1', 'class', 'Database', 'db.ts', 80, 80, [], []),
  };

  const initial = engine.project(nodes, 'AppService').projection;
  assert.equal(Object.keys(initial.nodes).length, 1);

  const expanded = engine.expand(initial, 'root', nodes);
  assert.equal(Object.keys(expanded.nodes).length, 3); // root, child1, ref1
});

test('AstProjectionEngine: collapse removes children recursively', () => {
  const engine = new AstProjectionEngine();
  
  const nodes: Record<string, AstProjectionNode> = {
    'root': makeNode('root', 'class', 'AppService', 'app.ts', 100, 100, ['child1', 'child2'], []),
    'child1': makeNode('child1', 'method', 'run', 'app.ts', 50, 50, ['child2'], [], 'root'),
    'child2': makeNode('child2', 'statement', 'callDb', 'app.ts', 30, 30, [], [], 'child1'),
  };

  const result = engine.project(nodes, 'AppService').projection;
  assert.equal(Object.keys(result.nodes).length, 3);

  // Colapsa root
  const collapsed = engine.collapse(result, 'root');
  // Deve conter apenas o root, e nenhum descendente
  assert.equal(Object.keys(collapsed.nodes).length, 1);
  assert.ok(collapsed.nodes['root']);
});

test('AstProjectionEngine: prune limits max nodes by priority', () => {
  const engine = new AstProjectionEngine({
    policy: {
      maxNodes: 2,
    }
  });

  const nodes: Record<string, AstProjectionNode> = {
    'root': makeNode('root', 'class', 'App', 'app.ts', 100, 100, ['child1'], ['ref1']),
    'child1': makeNode('child1', 'method', 'run', 'app.ts', 10, 50, [], [], 'root'), // Prioridade 10
    'ref1': makeNode('ref1', 'class', 'Db', 'db.ts', 80, 80, [], []), // Prioridade 80
  };

  const result = engine.project(nodes, 'App');

  // Deve ter cortado o child1 (menor prioridade)
  assert.equal(Object.keys(result.projection.nodes).length, 2);
  assert.ok(result.projection.nodes['root']);
  assert.ok(result.projection.nodes['ref1']);
  assert.ok(!result.projection.nodes['child1']);
  assert.equal(result.policyApplied, true);
});

test('AstProjectionEngine: policy violation throws error', () => {
  const engine = new AstProjectionEngine({
    policy: {
      maxDepth: 1, // Muito restritiva
    }
  });

  const nodes: Record<string, AstProjectionNode> = {
    'root': makeNode('root', 'class', 'AppService', 'app.ts', 100, 100, ['child1']),
    'child1': makeNode('child1', 'method', 'run', 'app.ts', 50, 50, [], [], 'root'),
  };

  assert.throws(() => {
    engine.project(nodes, 'AppService');
  }, AstProjectionPolicyViolation);
});

test('AstProjectionEngine: metrics and snapshots are correctly recorded', () => {
  const engine = new AstProjectionEngine();
  
  const nodes: Record<string, AstProjectionNode> = {
    'root': makeNode('root', 'class', 'AppService', 'app.ts', 100, 100),
  };

  const result = engine.project(nodes, 'AppService');

  const metrics = engine.getMetrics().getMetrics();
  assert.equal(metrics.nodesLoaded, 1);
  assert.ok(metrics.executionTime >= 0);

  const snapshot = engine.getSnapshot().getSnapshot();
  assert.equal(snapshot.projectionId, result.projection.id);
  assert.equal(snapshot.totalNodes, 1);
});

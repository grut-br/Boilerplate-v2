/**
 * QueryPlanner.test.ts
 *
 * Testes unitários para o Query Planner da Knowledge Engine.
 * Cobre planos simples/complexos, prioridades, limites, dependências, estimativas, métricas, snapshot e estratégias.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { QueryPlanner } from './QueryPlanner.ts';
import { PlanningContext } from './PlanningContext.ts';
import { PlanningPolicy } from './PlanningPolicy.ts';
import { SimplePlanningStrategy, DefaultPlanningStrategy } from './PlanningStrategy.ts';
import { PlanningPolicyViolation, InvalidPlanningInput } from './PlanningErrors.ts';
import type { KnowledgeRequest } from '../contracts/KnowledgeRequest.ts';

test('PlanningPolicy: default options work', () => {
  const policy = new PlanningPolicy();
  assert.equal(policy.maxProviders, 5);
  assert.ok(policy.fitsProviders(3));
  assert.ok(!policy.fitsProviders(6));
});

test('PlanningPolicy: custom options override default ones', () => {
  const policy = new PlanningPolicy({ maxProviders: 2, maxQueries: 3 });
  assert.equal(policy.maxProviders, 2);
  assert.equal(policy.maxQueries, 3);
  assert.ok(policy.fitsQueries(3));
  assert.ok(!policy.fitsQueries(4));
});

test('PlanningContext: holds metadata and options correctly', () => {
  const policy = new PlanningPolicy();
  const context = new PlanningContext({
    workspace: '/test/ws',
    capability: 'code',
    availableProviders: ['markdown', 'postgres'],
    preferredTypes: ['guide'],
    preferredTags: ['typescript'],
    policy,
  });

  assert.equal(context.workspace, '/test/ws');
  assert.equal(context.capability, 'code');
  assert.deepEqual(context.availableProviders, ['markdown', 'postgres']);
  assert.deepEqual(context.preferredTypes, ['guide']);
  assert.deepEqual(context.preferredTags, ['typescript']);
});

test('QueryPlanner: generate simple plan using SimplePlanningStrategy', () => {
  const planner = new QueryPlanner({
    strategy: new SimplePlanningStrategy(),
  });
  
  const req: KnowledgeRequest = {
    query: 'How to configure Supabase auth?',
    workspace: '/test/ws',
    capability: 'auth',
  };

  const plan = planner.createPlan(req, {
    workspace: '/test/ws',
    availableProviders: ['markdown', 'postgres'],
  });

  assert.equal(plan.nodes.length, 2); // 1 node por provider
  assert.equal(plan.providers.length, 2);
  assert.deepEqual(plan.executionOrder, [['qn-simple-markdown', 'qn-simple-postgres']]); // Sem dependências
  assert.equal(plan.depth, 1);
  assert.ok(plan.estimatedCost > 0);
  assert.ok(plan.estimatedTokens > 0);
});

test('QueryPlanner: generate complex plan using DefaultPlanningStrategy with dependencies', () => {
  const planner = new QueryPlanner({
    strategy: new DefaultPlanningStrategy(),
  });

  // Query contendo "and" (deve dividir a query em dois nós e gerar dependências)
  const req: KnowledgeRequest = {
    query: 'Configure Postgres tables e depois configure Row Level Security',
    workspace: '/test/ws',
    capability: 'db',
  };

  const plan = planner.createPlan(req, {
    workspace: '/test/ws',
    availableProviders: ['postgres'],
  });

  // 'postgres' provider deve gerar 2 nós (um para cada parte da query quebrada por "e depois")
  assert.equal(plan.nodes.length, 2);
  
  // O segundo nó deve depender do primeiro
  const [node1, node2] = plan.nodes;
  assert.equal(node2.dependencies.length, 1);
  assert.equal(node2.dependencies[0], node1.id);

  // A profundidade do plano de execução com dependência deve ser 2 camadas
  assert.equal(plan.executionOrder.length, 2);
  assert.deepEqual(plan.executionOrder, [[node1.id], [node2.id]]);
  assert.equal(plan.depth, 2);
});

test('QueryPlanner: prioritization boosts scores for target capabilities and tags', () => {
  const planner = new QueryPlanner();
  const req: KnowledgeRequest = {
    query: 'Read guides about typescript and next.js',
    workspace: '/test/ws',
    capability: 'next',
  };

  const plan = planner.createPlan(req, {
    workspace: '/test/ws',
    availableProviders: ['next-provider', 'other-provider'],
    preferredTags: ['typescript'],
  });

  // Nós referentes ao next-provider devem receber boost de prioridade e vir no topo
  assert.ok(plan.nodes.length > 0);
  const topNode = plan.nodes[0];
  assert.equal(topNode.provider, 'next-provider');
});

test('QueryPlanner: planning policy limits generate violations', () => {
  // Limita o custo máximo a 5
  const planner = new QueryPlanner({
    policy: {
      maxCost: 5,
    }
  });

  const req: KnowledgeRequest = {
    query: 'Configure a simple database lookup',
    workspace: '/test/ws',
  };

  assert.throws(() => {
    planner.createPlan(req, {
      workspace: '/test/ws',
      availableProviders: ['postgres'],
    });
  }, PlanningPolicyViolation);
});

test('QueryPlanner: throws on invalid planning input', () => {
  const planner = new QueryPlanner();
  assert.throws(() => {
    planner.createPlan({ query: '', workspace: '' });
  }, InvalidPlanningInput);
});

test('QueryPlanner: records correct metrics and snapshots', () => {
  const planner = new QueryPlanner();
  const req: KnowledgeRequest = {
    query: 'Simple test query',
    workspace: '/test/ws',
  };

  const plan = planner.createPlan(req, {
    workspace: '/test/ws',
    availableProviders: ['markdown'],
  });

  const metrics = planner.getMetrics().getMetrics();
  assert.equal(metrics.providersUsed, 1);
  assert.equal(metrics.queriesGenerated, 1);
  assert.ok(metrics.executionTime >= 0);

  const snapshot = planner.getSnapshot().getSnapshot();
  assert.equal(snapshot.planId, plan.id);
  assert.equal(snapshot.totalNodes, 1);
  assert.deepEqual(snapshot.providers, ['markdown']);
});

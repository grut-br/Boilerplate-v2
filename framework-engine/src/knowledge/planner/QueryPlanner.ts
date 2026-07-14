/**
 * QueryPlanner
 *
 * Componente principal da Query Planner Engine.
 * Decide estrategicamente quais informações consultar deterministicamente.
 */

import type { KnowledgeRequest } from '../contracts/KnowledgeRequest.ts';
import { PlanningContext, type PlanningContextOptions } from './PlanningContext.ts';
import { PlanningPolicy, type PlanningPolicyOptions } from './PlanningPolicy.ts';
import { PlanningMetrics } from './PlanningMetrics.ts';
import { PlanningSnapshot } from './PlanningSnapshot.ts';
import { PlanningPolicyViolation, InvalidPlanningInput } from './PlanningErrors.ts';
import type { QueryNode } from './QueryNode.ts';
import type { QueryPlan } from './QueryPlan.ts';
import { type PlanningStrategy, DefaultPlanningStrategy } from './PlanningStrategy.ts';

export interface QueryPlannerOptions {
  policy?: PlanningPolicyOptions;
  strategy?: PlanningStrategy;
}

export class QueryPlanner {
  private readonly policy: PlanningPolicy;
  private readonly metrics: PlanningMetrics;
  private readonly snapshot: PlanningSnapshot;
  private strategy: PlanningStrategy;

  constructor(options: QueryPlannerOptions = {}) {
    this.policy = new PlanningPolicy(options.policy);
    this.metrics = new PlanningMetrics();
    this.snapshot = new PlanningSnapshot();
    this.strategy = options.strategy ?? new DefaultPlanningStrategy();
  }

  setStrategy(strategy: PlanningStrategy): void {
    this.strategy = strategy;
  }

  getStrategy(): PlanningStrategy {
    return this.strategy;
  }

  getPolicy(): PlanningPolicy {
    return this.policy;
  }

  getMetrics(): PlanningMetrics {
    return this.metrics;
  }

  getSnapshot(): PlanningSnapshot {
    return this.snapshot;
  }

  /**
   * Prioriza deterministicamente os nós de consulta gerados.
   * Ajusta prioridades com base nas preferências e tags do contexto.
   */
  prioritize(nodes: QueryNode[], context: PlanningContext): QueryNode[] {
    return nodes.map(node => {
      let score = node.priority;

      // Se o provider deste nó coincide com a capability do contexto
      if (context.capability && node.provider.toLowerCase().includes(context.capability.toLowerCase())) {
        score += 15;
      }

      // Se a query deste nó contém tags preferenciais
      context.preferredTags.forEach(tag => {
        if (node.query.toLowerCase().includes(tag.toLowerCase())) {
          score += 10;
        }
      });

      return {
        ...node,
        priority: score,
      };
    }).sort((a, b) => b.priority - a.priority); // Ordena decrescente
  }

  /**
   * Calcula o custo estimado do plano de consulta.
   */
  estimateCost(nodes: QueryNode[]): number {
    return nodes.reduce((total, node) => total + node.estimatedCost, 0);
  }

  /**
   * Calcula o total estimado de tokens consumidos/retornados pelo plano.
   */
  estimateTokens(nodes: QueryNode[]): number {
    return nodes.reduce((total, node) => total + node.estimatedTokens, 0);
  }

  /**
   * Estima heuristicamente a quantidade de documentos a serem retornados.
   * Heurística determinística: 5 documentos por nó de consulta gerado.
   */
  estimateDocuments(nodes: QueryNode[]): number {
    return nodes.length * 5;
  }

  /**
   * Lista os providers únicos presentes nos nós de consulta.
   */
  estimateProviders(nodes: QueryNode[]): string[] {
    const providers = new Set<string>();
    nodes.forEach(node => providers.add(node.provider));
    return Array.from(providers);
  }

  /**
   * Resolve dependências e cria uma ordem de execução topológica por camadas paralelas.
   */
  buildExecutionOrder(nodes: QueryNode[]): string[][] {
    const order: string[][] = [];
    const visited = new Set<string>();
    const nodeMap = new Map<string, QueryNode>();
    nodes.forEach(node => nodeMap.set(node.id, node));

    let remaining = [...nodes];

    while (remaining.length > 0) {
      // Encontra nós cujas dependências já foram resolvidas/visitadas nesta rodada
      const layer = remaining.filter(node => {
        return node.dependencies.every(depId => visited.has(depId));
      });

      if (layer.length === 0) {
        // Ciclo detectado ou dependência não encontrada, resolve adicionando os restantes na marra para não travar
        order.push(remaining.map(n => n.id));
        break;
      }

      const layerIds = layer.map(node => node.id);
      order.push(layerIds);
      layerIds.forEach(id => visited.add(id));
      remaining = remaining.filter(node => !visited.has(node.id));
    }

    return order;
  }

  /**
   * Cria o plano de consulta completo para uma dada requisição e contexto de planejamento.
   * Valida limites definidos na política de planejamento.
   */
  createPlan(request: KnowledgeRequest, contextOpts: Omit<PlanningContextOptions, 'policy'> = { workspace: '' }): QueryPlan {
    if (!request || !request.query) {
      throw new InvalidPlanningInput('Request and query string must be defined');
    }

    this.metrics.reset();
    this.snapshot.reset();
    this.metrics.startTimer();

    // Constrói o contexto completo incluindo a política atual
    const context = new PlanningContext({
      ...contextOpts,
      workspace: request.workspace ?? contextOpts.workspace,
      capability: request.capability ?? contextOpts.capability,
      policy: this.policy,
    });

    // 1. Gera nós a partir da query usando a estratégia configurada
    let rawNodes = this.strategy.plan(request.query, context);

    // 2. Prioriza/Ajusta os nós
    let prioritizedNodes = this.prioritize(rawNodes, context);

    // 3. Aplica limites duros da PlanningPolicy (trunca nós excedentes se necessário)
    if (prioritizedNodes.length > this.policy.maxQueries) {
      prioritizedNodes = prioritizedNodes.slice(0, this.policy.maxQueries);
    }

    const uniqueProviders = this.estimateProviders(prioritizedNodes);
    if (uniqueProviders.length > this.policy.maxProviders) {
      // Remove nós de providers menos prioritários até caber no limite
      const allowedProviders = uniqueProviders.slice(0, this.policy.maxProviders);
      prioritizedNodes = prioritizedNodes.filter(node => allowedProviders.includes(node.provider));
    }

    // 4. Resolve ordem de execução (dependências)
    const executionOrder = this.buildExecutionOrder(prioritizedNodes);
    const depth = executionOrder.length;

    // 5. Calcula estimativas
    const totalCost = this.estimateCost(prioritizedNodes);
    const totalTokens = this.estimateTokens(prioritizedNodes);
    const totalDocuments = this.estimateDocuments(prioritizedNodes);

    // 6. Validação das políticas pós-limites
    if (!this.policy.fitsDepth(depth)) {
      throw new PlanningPolicyViolation('maxDepth', depth, this.policy.maxDepth);
    }
    if (!this.policy.fitsCost(totalCost)) {
      throw new PlanningPolicyViolation('maxCost', totalCost, this.policy.maxCost);
    }
    if (!this.policy.fitsEstimatedTokens(totalTokens)) {
      throw new PlanningPolicyViolation('maxEstimatedTokens', totalTokens, this.policy.maxEstimatedTokens);
    }
    if (!this.policy.fitsDocuments(totalDocuments)) {
      throw new PlanningPolicyViolation('maxDocuments', totalDocuments, this.policy.maxDocuments);
    }

    // 7. Mapeia metadados das prioridades
    const priorities: Record<string, number> = {};
    prioritizedNodes.forEach(node => {
      priorities[node.id] = node.priority;
    });

    // Mapeia capabilities e tags
    const capabilities = request.capability ? [request.capability] : [];
    const tags = context.preferredTags;
    const documentTypes = context.preferredTypes;

    const plan: QueryPlan = {
      id: `plan-${Math.random().toString(36).substring(2, 9)}`,
      nodes: prioritizedNodes,
      executionOrder,
      providers: uniqueProviders.filter(p => this.estimateProviders(prioritizedNodes).includes(p)),
      capabilities,
      documentTypes,
      tags,
      priorities,
      limits: this.policy.toObject(),
      depth,
      estimatedCost: totalCost,
      estimatedTokens: totalTokens,
      estimatedDocuments: totalDocuments,
      createdAt: Date.now(),
    };

    // 8. Registra métricas e snapshot
    this.metrics.recordMetrics({
      providersUsed: plan.providers.length,
      queriesGenerated: plan.nodes.length,
      estimatedTokens: plan.estimatedTokens,
      estimatedDocuments: plan.estimatedDocuments,
      estimatedCost: plan.estimatedCost,
    });
    this.metrics.stopTimer();

    this.snapshot.record(plan);

    return plan;
  }
}

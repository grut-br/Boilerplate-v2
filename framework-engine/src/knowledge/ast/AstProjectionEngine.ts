/**
 * AstProjectionEngine
 *
 * Motor responsável por gerar e gerenciar projeções parciais da AST e do Grafo de Símbolos.
 */

import type { AstProjection, AstEdge } from './AstProjection.ts';
import type { AstProjectionNode } from './AstProjectionNode.ts';
import { AstProjectionPolicy, type AstProjectionPolicyOptions } from './AstProjectionPolicy.ts';
import { AstProjectionMetrics } from './AstProjectionMetrics.ts';
import { AstProjectionSnapshot } from './AstProjectionSnapshot.ts';
import type { AstProjectionResult } from './AstProjectionResult.ts';
import { type AstProjectionStrategy, DefaultProjectionStrategy } from './AstProjectionStrategy.ts';
import { AstProjectionPolicyViolation, InvalidAstProjectionInput } from './AstProjectionErrors.ts';

export interface AstProjectionEngineOptions {
  policy?: AstProjectionPolicyOptions;
  strategy?: AstProjectionStrategy;
}

export class AstProjectionEngine {
  private readonly policy: AstProjectionPolicy;
  private readonly metrics: AstProjectionMetrics;
  private readonly snapshot: AstProjectionSnapshot;
  private strategy: AstProjectionStrategy;

  constructor(options: AstProjectionEngineOptions = {}) {
    this.policy = new AstProjectionPolicy(options.policy);
    this.metrics = new AstProjectionMetrics();
    this.snapshot = new AstProjectionSnapshot();
    this.strategy = options.strategy ?? new DefaultProjectionStrategy();
  }

  setStrategy(strategy: AstProjectionStrategy): void {
    this.strategy = strategy;
  }

  getStrategy(): AstProjectionStrategy {
    return this.strategy;
  }

  getPolicy(): AstProjectionPolicy {
    return this.policy;
  }

  getMetrics(): AstProjectionMetrics {
    return this.metrics;
  }

  getSnapshot(): AstProjectionSnapshot {
    return this.snapshot;
  }

  /**
   * Remove nós redundantes ou de baixa prioridade baseando-se nos limites da política.
   */
  prune(nodes: Record<string, AstProjectionNode>): Record<string, AstProjectionNode> {
    const pruned: Record<string, AstProjectionNode> = {};
    
    // Converte para array e ordena por prioridade (maior primeiro)
    const sortedNodes = Object.values(nodes).sort((a, b) => b.priority - a.priority);

    // Seleciona até o limite máximo da política
    const limitedNodes = sortedNodes.slice(0, this.policy.maxNodes);

    limitedNodes.forEach(node => {
      pruned[node.id] = { ...node };
    });

    // Corrige referências e filhos para conter apenas nós sobreviventes
    const survivedIds = new Set(Object.keys(pruned));
    Object.values(pruned).forEach(node => {
      node.children = node.children.filter(id => survivedIds.has(id));
      node.references = node.references.filter(id => survivedIds.has(id));
    });

    return pruned;
  }

  /**
   * Estima o número total de nós ativamente projetados.
   */
  estimateNodes(projection: AstProjection): number {
    return Object.keys(projection.nodes).length;
  }

  /**
   * Estima a quantidade de tokens representada pela projeção baseada no conteúdo ou peso.
   */
  estimateTokens(projection: AstProjection): number {
    return Object.values(projection.nodes).reduce((total, node) => {
      if (node.content) {
        return total + Math.ceil(node.content.length / 4);
      }
      return total + node.weight;
    }, 0);
  }

  /**
   * Calcula a profundidade máxima alcançada pelo grafo a partir de suas arestas pai-filho.
   */
  private calculateDepth(nodes: Record<string, AstProjectionNode>): number {
    let maxDepth = 0;
    const cache = new Map<string, number>();

    const getDepth = (id: string): number => {
      if (cache.has(id)) return cache.get(id)!;
      const node = nodes[id];
      if (!node || !node.parent || !nodes[node.parent]) {
        return 1;
      }
      const d = 1 + getDepth(node.parent);
      cache.set(id, d);
      return d;
    };

    Object.keys(nodes).forEach(id => {
      maxDepth = Math.max(maxDepth, getDepth(id));
    });

    return maxDepth;
  }

  /**
   * Constrói as arestas do grafo projetado de forma determinística.
   */
  private buildEdges(nodes: Record<string, AstProjectionNode>): AstEdge[] {
    const edges: AstEdge[] = [];
    const nodeIds = new Set(Object.keys(nodes));

    Object.values(nodes).forEach(node => {
      // Relação pai-filho
      if (node.parent && nodeIds.has(node.parent)) {
        edges.push({
          source: node.parent,
          target: node.id,
          type: 'parent-child',
        });
      }

      // Referências
      node.references.forEach(refId => {
        if (nodeIds.has(refId)) {
          edges.push({
            source: node.id,
            target: refId,
            type: 'reference',
          });
        }
      });
    });

    return edges;
  }

  /**
   * Gera a Projeção AST determinística a partir de um conjunto de nós de símbolos.
   */
  project(sourceNodes: Record<string, AstProjectionNode>, targetSymbol: string): AstProjectionResult {
    if (!sourceNodes || Object.keys(sourceNodes).length === 0) {
      throw new InvalidAstProjectionInput('Source nodes dictionary must be defined and not empty');
    }

    this.metrics.reset();
    this.snapshot.reset();
    this.metrics.startTimer();

    // 1. Aplica a estratégia de projeção
    let projectedNodes = this.strategy.project(sourceNodes, targetSymbol);

    // 2. Executa a poda (pruning) para respeitar limites
    const beforePruningCount = Object.keys(projectedNodes).length;
    projectedNodes = this.prune(projectedNodes);
    const afterPruningCount = Object.keys(projectedNodes).length;

    const nodesDiscarded = beforePruningCount - afterPruningCount;

    // 3. Constrói arestas e profundidade
    const edges = this.buildEdges(projectedNodes);
    const depth = this.calculateDepth(projectedNodes);

    // Mapeamento de dependências e arquivos
    const files = new Set<string>();
    const dependenciesSet = new Set<string>();
    const referencesSet = new Set<string>();
    const symbols: string[] = [];

    Object.values(projectedNodes).forEach(node => {
      files.add(node.file);
      symbols.push(node.identifier);
      node.references.forEach(ref => referencesSet.add(ref));
      if (node.metadata?.dependency) {
        dependenciesSet.add(node.metadata.dependency);
      }
    });

    const projectionId = `proj-${Math.random().toString(36).substring(2, 9)}`;

    const projection: AstProjection = {
      id: projectionId,
      nodes: projectedNodes,
      edges,
      depth,
      dependencies: Array.from(dependenciesSet),
      references: Array.from(referencesSet),
      symbols,
      metadata: {
        targetSymbol,
        fileCount: files.size,
      },
    };

    // 4. Calcula estimativas e telemetria
    const totalTokens = this.estimateTokens(projection);
    const totalFiles = files.size;
    const totalReferences = referencesSet.size;

    // 5. Valida políticas
    if (!this.policy.fitsDepth(depth)) {
      throw new AstProjectionPolicyViolation('maxDepth', depth, this.policy.maxDepth);
    }
    if (!this.policy.fitsFiles(totalFiles)) {
      throw new AstProjectionPolicyViolation('maxFiles', totalFiles, this.policy.maxFiles);
    }
    if (!this.policy.fitsReferences(totalReferences)) {
      throw new AstProjectionPolicyViolation('maxReferences', totalReferences, this.policy.maxReferences);
    }
    if (!this.policy.fitsTokens(totalTokens)) {
      throw new AstProjectionPolicyViolation('maxTokens', totalTokens, this.policy.maxTokens);
    }

    // 6. Registra métricas
    this.metrics.recordMetrics({
      nodesLoaded: afterPruningCount,
      nodesDiscarded,
      filesVisited: totalFiles,
      referencesVisited: totalReferences,
      estimatedTokens: totalTokens,
    });
    this.metrics.stopTimer();

    this.snapshot.record(projection, totalTokens);

    return {
      projection,
      metrics: this.metrics.getMetrics(),
      snapshot: this.snapshot.getSnapshot(),
      policyApplied: nodesDiscarded > 0,
      strategyUsed: this.strategy.name,
    };
  }

  /**
   * Expande recursivamente um nó adicionando seus filhos do conjunto original no grafo projetado.
   */
  expand(projection: AstProjection, nodeId: string, sourceNodes: Record<string, AstProjectionNode>): AstProjection {
    const node = sourceNodes[nodeId];
    if (!node) return projection;

    const newNodes = { ...projection.nodes };
    
    // Adiciona filhos
    node.children.forEach(childId => {
      const child = sourceNodes[childId];
      if (child) {
        newNodes[child.id] = { ...child };
      }
    });

    // Adiciona referências
    node.references.forEach(refId => {
      const ref = sourceNodes[refId];
      if (ref) {
        newNodes[ref.id] = { ...ref };
      }
    });

    const edges = this.buildEdges(newNodes);
    const depth = this.calculateDepth(newNodes);
    const symbols = Object.values(newNodes).map(n => n.identifier);

    return {
      ...projection,
      nodes: newNodes,
      edges,
      depth,
      symbols,
    };
  }

  /**
   * Colapsa um nó removendo todos os seus descendentes/filhos recursivamente do grafo projetado.
   */
  collapse(projection: AstProjection, nodeId: string): AstProjection {
    const target = projection.nodes[nodeId];
    if (!target) return projection;

    const newNodes = { ...projection.nodes };
    const toRemove = new Set<string>();

    const collectDescendants = (id: string) => {
      const node = newNodes[id];
      if (!node) return;
      node.children.forEach(childId => {
        if (newNodes[childId]) {
          toRemove.add(childId);
          collectDescendants(childId);
        }
      });
    };

    collectDescendants(nodeId);

    // Remove nós descendentes
    toRemove.forEach(id => {
      delete newNodes[id];
    });

    // Remove referências para os nós removidos dos nós remanescentes
    Object.values(newNodes).forEach(node => {
      node.children = node.children.filter(id => !toRemove.has(id));
      node.references = node.references.filter(id => !toRemove.has(id));
    });

    const edges = this.buildEdges(newNodes);
    const depth = this.calculateDepth(newNodes);
    const symbols = Object.values(newNodes).map(n => n.identifier);

    return {
      ...projection,
      nodes: newNodes,
      edges,
      depth,
      symbols,
    };
  }
}

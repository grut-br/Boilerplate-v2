/**
 * AstProjectionStrategy
 *
 * Define o contrato para estratégias de projeção de AST e implementa as estratégias padrão, minimalista e de dependências.
 */

import type { AstProjectionNode } from './AstProjectionNode.ts';

export interface AstProjectionStrategy {
  readonly name: string;
  project(nodes: Record<string, AstProjectionNode>, targetSymbol: string): Record<string, AstProjectionNode>;
}

/**
 * DefaultProjectionStrategy
 * Projeta o nó alvo, seus filhos diretos e suas referências imediatas.
 */
export class DefaultProjectionStrategy implements AstProjectionStrategy {
  readonly name = 'default';

  project(nodes: Record<string, AstProjectionNode>, targetSymbol: string): Record<string, AstProjectionNode> {
    const projected: Record<string, AstProjectionNode> = {};
    const rootNode = Object.values(nodes).find(n => n.identifier === targetSymbol);
    
    if (!rootNode) return projected;

    // Adiciona o nó raiz
    projected[rootNode.id] = { ...rootNode };

    // Adiciona filhos diretos
    rootNode.children.forEach(childId => {
      const child = nodes[childId];
      if (child) {
        projected[child.id] = { ...child };
      }
    });

    // Adiciona referências diretas do nó raiz
    rootNode.references.forEach(refId => {
      const ref = nodes[refId];
      if (ref) {
        projected[ref.id] = { ...ref };
      }
    });

    return projected;
  }
}

/**
 * MinimalProjectionStrategy
 * Projeta estritamente o nó alvo sem expandir filhos ou referências adicionais.
 */
export class MinimalProjectionStrategy implements AstProjectionStrategy {
  readonly name = 'minimal';

  project(nodes: Record<string, AstProjectionNode>, targetSymbol: string): Record<string, AstProjectionNode> {
    const projected: Record<string, AstProjectionNode> = {};
    const rootNode = Object.values(nodes).find(n => n.identifier === targetSymbol);
    
    if (!rootNode) return projected;

    projected[rootNode.id] = {
      ...rootNode,
      children: [], // Colapsa os filhos no minimal
      references: [], // Colapsa referências no minimal
    };

    return projected;
  }
}

/**
 * DependencyProjectionStrategy
 * Projeta o nó alvo e caminha recursivamente por suas referências para construir a cadeia de dependências.
 */
export class DependencyProjectionStrategy implements AstProjectionStrategy {
  readonly name = 'dependency';
  private readonly maxDepth: number;

  constructor(maxDepth = 3) {
    this.maxDepth = maxDepth;
  }

  project(nodes: Record<string, AstProjectionNode>, targetSymbol: string): Record<string, AstProjectionNode> {
    const projected: Record<string, AstProjectionNode> = {};
    const rootNode = Object.values(nodes).find(n => n.identifier === targetSymbol);
    
    if (!rootNode) return projected;

    const queue: { nodeId: string; currentDepth: number }[] = [{ nodeId: rootNode.id, currentDepth: 0 }];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const { nodeId, currentDepth } = queue.shift()!;
      if (visited.has(nodeId) || currentDepth > this.maxDepth) continue;

      visited.add(nodeId);
      const node = nodes[nodeId];
      if (!node) continue;

      projected[node.id] = { ...node };

      // Adiciona referências para processar na fila de dependências
      node.references.forEach(refId => {
        if (!visited.has(refId)) {
          queue.push({ nodeId: refId, currentDepth: currentDepth + 1 });
        }
      });
    }

    return projected;
  }
}

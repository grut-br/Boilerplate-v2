/**
 * AstProjection
 *
 * Representação da projeção de AST final contendo o grafo filtrado e estatísticas.
 */

import type { AstProjectionNode } from './AstProjectionNode.ts';

export interface AstEdge {
  source: string; // ID de origem
  target: string; // ID de destino
  type: 'parent-child' | 'reference' | 'dependency'; // Tipo de relação
}

export interface AstProjection {
  id: string; // ID da projeção
  nodes: Record<string, AstProjectionNode>; // Mapeamento de ID para o nó da AST projetada
  edges: AstEdge[]; // Conexões ativas no grafo projetado
  depth: number; // Profundidade máxima do grafo projetado
  dependencies: string[]; // Dependências externas do grafo (ex: imports)
  references: string[]; // Referências cruzadas incluídas
  symbols: string[]; // Lista de nomes de símbolos contidos
  metadata: Record<string, any>; // Metadados adicionais
}

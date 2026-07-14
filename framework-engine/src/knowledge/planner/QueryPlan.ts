/**
 * QueryPlan
 *
 * Representa o plano final de consultas estruturado gerado pelo Query Planner.
 */

import type { QueryNode } from './QueryNode.ts';
import type { PlanningPolicyOptions } from './PlanningPolicy.ts';

export interface QueryPlan {
  id: string; // Identificador único do plano
  nodes: QueryNode[]; // Lista de nós/etapas de consulta gerados
  executionOrder: string[][]; // Ordem de execução em lote/camadas paralelas baseada em dependências
  providers: string[]; // Providers envolvidos no plano
  capabilities: string[]; // Capabilities mapeadas/usadas
  documentTypes: string[]; // Tipos de documentos desejados/planejados
  tags: string[]; // Tags envolvidas no planejamento
  priorities: Record<string, number>; // Mapeamento de ID do nó para sua prioridade
  limits: PlanningPolicyOptions; // Limites da política aplicada a este plano
  depth: number; // Profundidade máxima de dependências (níveis de lotes de execução)
  estimatedCost: number; // Estimativa de custo total
  estimatedTokens: number; // Estimativa de tokens totais
  estimatedDocuments: number; // Estimativa de documentos totais a serem retornados
  createdAt: number; // Timestamp de criação
}

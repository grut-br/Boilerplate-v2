/**
 * QueryNode
 *
 * Representa um nó ou etapa individual de consulta no plano de execução de busca.
 */

export interface QueryNode {
  id: string; // Identificador único da etapa
  provider: string; // Nome ou ID do KnowledgeProvider alvo
  query: string; // A string de consulta gerada
  priority: number; // Prioridade do nó de consulta (quanto maior, mais prioritário)
  estimatedCost: number; // Estimativa de custo de execução
  estimatedTokens: number; // Estimativa de tokens consumidos/retornados
  dependencies: string[]; // IDs de QueryNodes dos quais este depende
  weight: number; // Peso estratégico da consulta
  metadata?: Record<string, any>; // Metadados opcionais adicionais
}

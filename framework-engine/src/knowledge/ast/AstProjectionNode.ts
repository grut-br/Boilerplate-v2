/**
 * AstProjectionNode
 *
 * Representa um nó individual da projeção AST abstrata.
 */

export interface AstRange {
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
}

export interface AstProjectionNode {
  id: string; // Identificador único do nó
  kind: string; // Ex: 'class', 'method', 'function', 'interface', 'variable'
  identifier: string; // Nome do símbolo
  file: string; // Caminho do arquivo de origem
  range: AstRange; // Localização exata no código
  parent?: string; // ID do nó pai
  children: string[]; // IDs dos nós filhos
  references: string[]; // IDs de outros nós/símbolos que este nó referencia
  priority: number; // Prioridade do nó para projeção
  weight: number; // Peso heurístico do conteúdo (ex: tamanho em tokens/linhas)
  content?: string; // Código fonte associado a este nó (sintético/abstrato)
  metadata?: Record<string, any>;
}

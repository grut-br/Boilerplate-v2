/**
 * PromptMetadata
 *
 * Registra o estado completo das camadas anteriores e configurações de orçamento aplicadas.
 */

export interface PromptMetadata {
  providers: string[]; // Providers envolvidos
  planner?: {
    strategy: string;
    nodesCount: number;
    depth: number;
  };
  resolver?: {
    strategy: string;
  };
  cache?: {
    hit: boolean;
  };
  compression?: {
    ratio: number;
    tokensSaved: number;
    policyApplied: boolean;
  };
  projection?: {
    nodesCount: number;
    depth: number;
    policyApplied: boolean;
  };
  budget: {
    maxTokens: number;
    usableTokens: number;
  };
  timestamp: number;
}

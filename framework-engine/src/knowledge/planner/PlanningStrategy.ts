/**
 * PlanningStrategy
 *
 * Declara o contrato para estratégias de planejamento e implementa a estratégia padrão (DefaultPlanningStrategy).
 */

import type { PlanningContext } from './PlanningContext.ts';
import type { QueryNode } from './QueryNode.ts';
import { PlanningStrategyError } from './PlanningErrors.ts';

export interface PlanningStrategy {
  readonly name: string;
  plan(query: string, context: PlanningContext): QueryNode[];
}

export class DefaultPlanningStrategy implements PlanningStrategy {
  readonly name = 'default';

  /**
   * Decompõe deterministicamente a query em um conjunto de QueryNodes
   * com base nos providers disponíveis e no contexto de planejamento.
   */
  plan(query: string, context: PlanningContext): QueryNode[] {
    if (!query.trim()) {
      return [];
    }

    const providers = context.availableProviders.length > 0
      ? context.availableProviders
      : ['markdown']; // Default fallback

    const nodes: QueryNode[] = [];
    
    // Decompõe a query principal por conectivos para detectar possíveis subtópicos independentes/dependentes
    // e simular um plano complexo de dependências.
    const subqueries = query
      .split(/\s+(?:e|depois|então|and|then)\s+/i)
      .map(part => part.trim())
      .filter(part => part.length > 0);

    let previousNodeId: string | undefined = undefined;

    subqueries.forEach((subquery, index) => {
      // Para cada subtópico, vamos criar uma consulta para os providers disponíveis
      providers.forEach((provider, pIndex) => {
        const id = `qn-${index}-${provider}`;
        
        // Determina prioridade baseada em se o provider é preferencial ou se a capability combina
        let priority = 10;
        if (context.capability && provider.includes(context.capability)) {
          priority += 20;
        }
        // Mais prioritário conforme a ordem dos subtópicos
        priority -= index * 2;

        // Estima custo deterministicamente:
        // Custo base = 10. +5 se for query longa, +5 se depender do nó anterior.
        let estimatedCost = 10;
        if (subquery.length > 30) estimatedCost += 5;
        if (previousNodeId) estimatedCost += 5;

        // Estima tokens deterministicamente:
        const estimatedTokens = Math.min(
          context.policy.maxEstimatedTokens / 4,
          subquery.length * 5 + 100
        );

        // Define dependências:
        // Exemplo: O nó do segundo subtópico depende do nó do primeiro subtópico (ou se o pIndex > 0 do mesmo subtópico)
        const dependencies: string[] = [];
        if (previousNodeId && index > 0) {
          dependencies.push(previousNodeId);
        }

        // Calcula peso estratégico:
        // Aumenta peso se houver tags ou termos preferenciais na subquery
        let weight = 1.0;
        context.preferredTags.forEach(tag => {
          if (subquery.toLowerCase().includes(tag.toLowerCase())) {
            weight += 0.5;
          }
        });
        context.preferredTypes.forEach(type => {
          if (subquery.toLowerCase().includes(type.toLowerCase())) {
            weight += 0.3;
          }
        });

        nodes.push({
          id,
          provider,
          query: subquery,
          priority,
          estimatedCost,
          estimatedTokens,
          dependencies,
          weight: parseFloat(weight.toFixed(2)),
          metadata: {
            subqueryIndex: index,
            subqueryLength: subquery.length,
          }
        });

        // O primeiro provider deste subtópico se torna o "previousNodeId" para o próximo subtópico
        if (pIndex === 0) {
          previousNodeId = id;
        }
      });
    });

    return nodes;
  }
}

/**
 * Estratégia de Consulta Direta/Simples (apenas gera 1 nó por provider para a query inteira, sem decomposição).
 */
export class SimplePlanningStrategy implements PlanningStrategy {
  readonly name = 'simple';

  plan(query: string, context: PlanningContext): QueryNode[] {
    if (!query.trim()) {
      return [];
    }

    const providers = context.availableProviders.length > 0
      ? context.availableProviders
      : ['markdown'];

    return providers.map((provider, index) => {
      const id = `qn-simple-${provider}`;
      const estimatedTokens = Math.min(500, query.length * 4);
      
      return {
        id,
        provider,
        query: query.trim(),
        priority: 50 - index,
        estimatedCost: 10,
        estimatedTokens,
        dependencies: [],
        weight: 1.0,
      };
    });
  }
}

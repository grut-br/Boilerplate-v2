/**
 * PromptOptimizer
 *
 * Responsável por ordenar seções, remover redundâncias e podar o contexto excedente.
 */

import { PromptSection } from './PromptSection.ts';
import type { PromptLayout } from './PromptLayout.ts';
import type { PromptBudget } from './PromptBudget.ts';
import type { PromptPolicies } from './PromptPolicies.ts';
import { PromptBudgetExceeded, MandatorySectionMissing } from './PromptErrors.ts';

export class PromptOptimizer {
  /**
   * Remove redundâncias simples como whitespaces extras e newlines em excesso.
   */
  private removeRedundancies(content: string): string {
    return content
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n') // Colapsa múltiplos newlines vazios
      .trim();
  }

  /**
   * Otimiza a lista de seções ordenando-as e podando opcionais até caber no orçamento útil.
   */
  optimize(
    sections: PromptSection[],
    layout: PromptLayout,
    budget: PromptBudget,
    policies: PromptPolicies
  ): { optimizedSections: PromptSection[]; tokensSaved: number } {
    // 1. Remove redundâncias do conteúdo de cada seção
    sections.forEach(sec => {
      sec.content = this.removeRedundancies(sec.content);
    });

    // 2. Filtra apenas as seções que pertencem ao layout ativo
    let layoutSections = sections.filter(sec => layout.sectionsOrder.includes(sec.name));

    // 3. Valida se todas as seções obrigatórias estão presentes
    policies.mandatorySections.forEach(mandatoryName => {
      // Se a seção mandatória for necessária no layout mas não foi enviada
      if (layout.sectionsOrder.includes(mandatoryName) && !layoutSections.some(sec => sec.name === mandatoryName)) {
        throw new MandatorySectionMissing(mandatoryName);
      }
    });

    // Ordena de acordo com o Layout
    const sortLayout = (a: PromptSection, b: PromptSection) => {
      return layout.sectionsOrder.indexOf(a.name) - layout.sectionsOrder.indexOf(b.name);
    };

    layoutSections.sort(sortLayout);

    const getEstimatedTotal = (secs: PromptSection[]): number => {
      return secs.reduce((sum, sec) => sum + sec.estimateTokens(), 0);
    };

    const usableLimit = budget.getUsableBudget();
    let currentTokens = getEstimatedTotal(layoutSections);
    let tokensSaved = 0;

    // 4. Se exceder o orçamento, descarta seções opcionais baseado em prioridade
    if (currentTokens > usableLimit) {
      // Separa obrigatórias e opcionais
      const mandatory = layoutSections.filter(sec => sec.isMandatory || policies.isMandatory(sec.name));
      const optional = layoutSections.filter(sec => !sec.isMandatory && !policies.isMandatory(sec.name));

      // Ordena opcionais por prioridade crescente (menor prioridade primeiro para ser descartada antes)
      optional.sort((a, b) => {
        const prioA = policies.getPriority(a.name);
        const prioB = policies.getPriority(b.name);
        return prioA - prioB;
      });

      // Descarta opcionais até caber no orçamento
      while (optional.length > 0 && currentTokens > usableLimit) {
        const discarded = optional.shift()!;
        tokensSaved += discarded.estimateTokens();
        
        // Remove do layout principal
        layoutSections = layoutSections.filter(sec => sec.name !== discarded.name);
        currentTokens = getEstimatedTotal(layoutSections);
      }

      // Se mesmo após descartar todas as opcionais o orçamento estourar
      if (currentTokens > usableLimit && policies.budgetPolicies.failOnBudgetExceeded) {
        throw new PromptBudgetExceeded(currentTokens, usableLimit);
      }
    }

    // Ordena o resultado final novamente conforme a disposição do layout
    layoutSections.sort(sortLayout);

    return {
      optimizedSections: layoutSections,
      tokensSaved,
    };
  }
}

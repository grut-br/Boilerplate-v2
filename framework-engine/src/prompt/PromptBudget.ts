/**
 * PromptBudget
 *
 * Gerencia limites de tokens, margem de segurança e margem de reserva.
 */

export interface PromptBudgetOptions {
  maxTokens?: number;
  reservedTokens?: number;
  minimumContextTokens?: number;
  safetyMarginPercentage?: number; // Ex: 0.05 para 5%
  compressionThresholdPercentage?: number; // Ex: 0.8 para 80% do limite máximo
  providerLimits?: Record<string, number>;
}

export const DEFAULT_PROMPT_BUDGET: Required<PromptBudgetOptions> = {
  maxTokens: 16000,
  reservedTokens: 2000,
  minimumContextTokens: 1000,
  safetyMarginPercentage: 0.05,
  compressionThresholdPercentage: 0.8,
  providerLimits: {
    'openai': 16384,
    'anthropic': 200000,
    'gemini': 1000000,
  },
};

export class PromptBudget {
  readonly maxTokens: number;
  readonly reservedTokens: number;
  readonly minimumContextTokens: number;
  readonly safetyMarginPercentage: number;
  readonly compressionThresholdPercentage: number;
  readonly providerLimits: Record<string, number>;

  constructor(options: PromptBudgetOptions = {}) {
    this.maxTokens = options.maxTokens ?? DEFAULT_PROMPT_BUDGET.maxTokens;
    this.reservedTokens = options.reservedTokens ?? DEFAULT_PROMPT_BUDGET.reservedTokens;
    this.minimumContextTokens = options.minimumContextTokens ?? DEFAULT_PROMPT_BUDGET.minimumContextTokens;
    this.safetyMarginPercentage = options.safetyMarginPercentage ?? DEFAULT_PROMPT_BUDGET.safetyMarginPercentage;
    this.compressionThresholdPercentage = options.compressionThresholdPercentage ?? DEFAULT_PROMPT_BUDGET.compressionThresholdPercentage;
    this.providerLimits = options.providerLimits ?? DEFAULT_PROMPT_BUDGET.providerLimits;
  }

  /**
   * Calcula o limite útil do orçamento após descontar tokens reservados e a margem de segurança.
   */
  getUsableBudget(): number {
    const safetyMargin = Math.ceil(this.maxTokens * this.safetyMarginPercentage);
    return Math.max(0, this.maxTokens - this.reservedTokens - safetyMargin);
  }

  /**
   * Verifica se o tamanho estimado cabe no orçamento.
   */
  fits(estimatedTokens: number): boolean {
    return estimatedTokens <= this.getUsableBudget();
  }

  /**
   * Verifica se atingiu o limiar de compressão necessário.
   */
  shouldCompress(currentTokens: number): boolean {
    return currentTokens >= (this.maxTokens * this.compressionThresholdPercentage);
  }
}

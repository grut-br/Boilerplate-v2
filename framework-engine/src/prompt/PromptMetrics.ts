/**
 * PromptMetrics
 *
 * Captura e consolida as métricas do processo de montagem e otimização do prompt.
 */

export interface PromptMetricsData {
  tokensEstimados: number; // Quantidade de tokens no prompt final
  tokensEconomizados: number; // Quantidade de tokens descartados na otimização
  compressionRatio: number; // Taxa de otimização de tokens (removidos / original)
  sections: number; // Número de seções mantidas
  executionTime: number; // Tempo de processamento em ms
  budgetUsage: number; // Uso percentual do orçamento disponível (0-1)
}

export class PromptMetrics {
  private startTime = 0;
  private executionTime = 0;
  private tokensEstimados = 0;
  private tokensEconomizados = 0;
  private compressionRatio = 0;
  private sectionsCount = 0;
  private budgetUsage = 0;

  startTimer(): void {
    this.startTime = Date.now();
  }

  stopTimer(): void {
    if (this.startTime > 0) {
      this.executionTime = Date.now() - this.startTime;
    }
  }

  record(data: {
    tokensEstimados: number;
    tokensEconomizados: number;
    sections: number;
    usableBudget: number;
  }): void {
    this.tokensEstimados = data.tokensEstimados;
    this.tokensEconomizados = data.tokensEconomizados;
    this.sectionsCount = data.sections;
    
    const originalTokens = data.tokensEstimados + data.tokensEconomizados;
    this.compressionRatio = originalTokens > 0
      ? parseFloat((data.tokensEconomizados / originalTokens).toFixed(4))
      : 0;

    this.budgetUsage = data.usableBudget > 0
      ? parseFloat((data.tokensEstimados / data.usableBudget).toFixed(4))
      : 0;
  }

  getMetrics(): PromptMetricsData {
    return {
      tokensEstimados: this.tokensEstimados,
      tokensEconomizados: this.tokensEconomizados,
      compressionRatio: this.compressionRatio,
      sections: this.sectionsCount,
      executionTime: this.executionTime,
      budgetUsage: this.budgetUsage,
    };
  }

  reset(): void {
    this.startTime = 0;
    this.executionTime = 0;
    this.tokensEstimados = 0;
    this.tokensEconomizados = 0;
    this.compressionRatio = 0;
    this.sectionsCount = 0;
    this.budgetUsage = 0;
  }
}

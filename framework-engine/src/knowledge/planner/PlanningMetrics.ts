/**
 * PlanningMetrics
 *
 * Registra métricas agregadas sobre a execução do planejamento.
 */

export interface PlanningMetricsData {
  providersUsed: number;
  queriesGenerated: number;
  estimatedTokens: number;
  estimatedDocuments: number;
  estimatedCost: number;
  executionTime: number;
}

export class PlanningMetrics {
  private providersUsed = 0;
  private queriesGenerated = 0;
  private estimatedTokens = 0;
  private estimatedDocuments = 0;
  private estimatedCost = 0;
  private startTime = 0;
  private executionTime = 0;

  startTimer(): void {
    this.startTime = Date.now();
  }

  stopTimer(): void {
    if (this.startTime > 0) {
      this.executionTime = Date.now() - this.startTime;
    }
  }

  recordMetrics(data: {
    providersUsed: number;
    queriesGenerated: number;
    estimatedTokens: number;
    estimatedDocuments: number;
    estimatedCost: number;
  }): void {
    this.providersUsed = data.providersUsed;
    this.queriesGenerated = data.queriesGenerated;
    this.estimatedTokens = data.estimatedTokens;
    this.estimatedDocuments = data.estimatedDocuments;
    this.estimatedCost = data.estimatedCost;
  }

  getMetrics(): PlanningMetricsData {
    return {
      providersUsed: this.providersUsed,
      queriesGenerated: this.queriesGenerated,
      estimatedTokens: this.estimatedTokens,
      estimatedDocuments: this.estimatedDocuments,
      estimatedCost: this.estimatedCost,
      executionTime: this.executionTime,
    };
  }

  reset(): void {
    this.providersUsed = 0;
    this.queriesGenerated = 0;
    this.estimatedTokens = 0;
    this.estimatedDocuments = 0;
    this.estimatedCost = 0;
    this.startTime = 0;
    this.executionTime = 0;
  }
}

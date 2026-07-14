/**
 * AstProjectionMetrics
 *
 * Registra métricas agregadas da execução da projeção de AST.
 */

export interface AstProjectionMetricsData {
  nodesLoaded: number;
  nodesDiscarded: number;
  filesVisited: number;
  referencesVisited: number;
  estimatedTokens: number;
  executionTime: number;
}

export class AstProjectionMetrics {
  private nodesLoaded = 0;
  private nodesDiscarded = 0;
  private filesVisited = 0;
  private referencesVisited = 0;
  private estimatedTokens = 0;
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
    nodesLoaded: number;
    nodesDiscarded: number;
    filesVisited: number;
    referencesVisited: number;
    estimatedTokens: number;
  }): void {
    this.nodesLoaded = data.nodesLoaded;
    this.nodesDiscarded = data.nodesDiscarded;
    this.filesVisited = data.filesVisited;
    this.referencesVisited = data.referencesVisited;
    this.estimatedTokens = data.estimatedTokens;
  }

  getMetrics(): AstProjectionMetricsData {
    return {
      nodesLoaded: this.nodesLoaded,
      nodesDiscarded: this.nodesDiscarded,
      filesVisited: this.filesVisited,
      referencesVisited: this.referencesVisited,
      estimatedTokens: this.estimatedTokens,
      executionTime: this.executionTime,
    };
  }

  reset(): void {
    this.nodesLoaded = 0;
    this.nodesDiscarded = 0;
    this.filesVisited = 0;
    this.referencesVisited = 0;
    this.estimatedTokens = 0;
    this.startTime = 0;
    this.executionTime = 0;
  }
}

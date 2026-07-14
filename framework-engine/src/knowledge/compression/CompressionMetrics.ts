/**
 * CompressionMetrics
 *
 * Registra métricas de compressão: documentos removidos, duplicatas,
 * nodes removidos, tokens economizados, ratio e tempo de execução.
 * Tudo determinístico — sem IA.
 */

export interface CompressionMetricsData {
  /** Total de documentos removidos durante a compressão */
  documentsRemoved: number;

  /** Documentos removidos especificamente por duplicação */
  duplicatesRemoved: number;

  /** Nodes removidos durante a compressão */
  nodesRemoved: number;

  /** Estimativa de tokens economizados (baseada em heurística de chars/4) */
  estimatedTokensSaved: number;

  /** Ratio de compressão: (input - output) / input, de 0 a 1 */
  compressionRatio: number;

  /** Tempo total de execução da compressão em milissegundos */
  executionTime: number;
}

export class CompressionMetrics {
  private documentsRemoved = 0;
  private duplicatesRemoved = 0;
  private nodesRemoved = 0;
  private estimatedTokensSaved = 0;
  private compressionRatio = 0;
  private startTime = 0;
  private executionTime = 0;

  /** Inicia o cronômetro de execução */
  startTimer(): void {
    this.startTime = Date.now();
  }

  /** Para o cronômetro e registra o tempo de execução */
  stopTimer(): void {
    if (this.startTime > 0) {
      this.executionTime = Date.now() - this.startTime;
    }
  }

  /** Incrementa o contador de documentos removidos */
  recordDocumentRemoved(): void {
    this.documentsRemoved++;
  }

  /** Incrementa o contador de duplicatas removidas */
  recordDuplicateRemoved(): void {
    this.duplicatesRemoved++;
    this.documentsRemoved++;
  }

  /** Registra uma remoção de N documentos em lote */
  recordDocumentsRemoved(count: number): void {
    this.documentsRemoved += count;
  }

  /** Incrementa o contador de nodes removidos */
  recordNodeRemoved(): void {
    this.nodesRemoved++;
  }

  /** Registra remoção de N nodes em lote */
  recordNodesRemoved(count: number): void {
    this.nodesRemoved += count;
  }

  /**
   * Calcula e registra tokens estimados economizados e o ratio de compressão.
   * Usa heurística: 1 token ≈ 4 caracteres (padrão GPT-style).
   *
   * @param inputChars  - total de caracteres antes da compressão
   * @param outputChars - total de caracteres após a compressão
   */
  recordCompression(inputChars: number, outputChars: number): void {
    const savedChars = Math.max(0, inputChars - outputChars);
    this.estimatedTokensSaved = Math.floor(savedChars / 4);

    if (inputChars > 0) {
      this.compressionRatio = parseFloat(((inputChars - outputChars) / inputChars).toFixed(4));
    } else {
      this.compressionRatio = 0;
    }
  }

  /** Retorna snapshot imutável das métricas */
  getMetrics(): CompressionMetricsData {
    return {
      documentsRemoved: this.documentsRemoved,
      duplicatesRemoved: this.duplicatesRemoved,
      nodesRemoved: this.nodesRemoved,
      estimatedTokensSaved: this.estimatedTokensSaved,
      compressionRatio: this.compressionRatio,
      executionTime: this.executionTime,
    };
  }

  /** Reseta todas as métricas */
  reset(): void {
    this.documentsRemoved = 0;
    this.duplicatesRemoved = 0;
    this.nodesRemoved = 0;
    this.estimatedTokensSaved = 0;
    this.compressionRatio = 0;
    this.startTime = 0;
    this.executionTime = 0;
  }
}

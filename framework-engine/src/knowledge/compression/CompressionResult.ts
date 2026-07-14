/**
 * CompressionResult
 *
 * Resultado final produzido pela Context Compression Engine.
 * Contém o KnowledgeResult comprimido, métricas e snapshot.
 */

import type { KnowledgeResult } from '../contracts/KnowledgeResult.ts';
import type { CompressionMetricsData } from './CompressionMetrics.ts';
import type { CompressionSnapshotData } from './CompressionSnapshot.ts';

export interface CompressionResult {
  /**
   * O KnowledgeResult após todas as etapas de compressão.
   * O conteúdo lógico é preservado integralmente.
   */
  result: KnowledgeResult;

  /**
   * Métricas detalhadas da compressão realizada.
   */
  metrics: CompressionMetricsData;

  /**
   * Snapshot com estado antes/depois e diferença percentual.
   */
  snapshot: CompressionSnapshotData;

  /**
   * Indica se algum limite de política foi atingido durante a compressão.
   */
  policyApplied: boolean;

  /**
   * Etapas do pipeline que foram executadas, na ordem.
   */
  stages: string[];
}

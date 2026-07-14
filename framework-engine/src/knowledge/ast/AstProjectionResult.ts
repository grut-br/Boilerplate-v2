/**
 * AstProjectionResult
 *
 * Representa o resultado de uma operação de projeção AST com metadados e métricas.
 */

import type { AstProjection } from './AstProjection.ts';
import type { AstProjectionMetricsData } from './AstProjectionMetrics.ts';
import type { AstProjectionSnapshotData } from './AstProjectionSnapshot.ts';

export interface AstProjectionResult {
  projection: AstProjection;
  metrics: AstProjectionMetricsData;
  snapshot: AstProjectionSnapshotData;
  policyApplied: boolean;
  strategyUsed: string;
}

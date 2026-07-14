/**
 * PlanningSnapshot
 *
 * Registra o estado e características do plano gerado para auditoria e log.
 */

import type { QueryPlan } from './QueryPlan.ts';

export interface PlanningSnapshotData {
  planId: string;
  totalNodes: number;
  executionLayers: number;
  providers: string[];
  capabilities: string[];
  documentTypes: string[];
  tags: string[];
  priorities: Record<string, number>;
  estimatedCost: number;
  estimatedTokens: number;
  estimatedDocuments: number;
  timestamp: number;
  fullPlan?: QueryPlan; // Inclui o plano completo para auditoria detalhada
}

export class PlanningSnapshot {
  private snapshotData: PlanningSnapshotData | null = null;

  record(plan: QueryPlan): void {
    this.snapshotData = {
      planId: plan.id,
      totalNodes: plan.nodes.length,
      executionLayers: plan.executionOrder.length,
      providers: [...plan.providers],
      capabilities: [...plan.capabilities],
      documentTypes: [...plan.documentTypes],
      tags: [...plan.tags],
      priorities: { ...plan.priorities },
      estimatedCost: plan.estimatedCost,
      estimatedTokens: plan.estimatedTokens,
      estimatedDocuments: plan.estimatedDocuments,
      timestamp: Date.now(),
      fullPlan: JSON.parse(JSON.stringify(plan)), // Deep clone simples
    };
  }

  getSnapshot(): PlanningSnapshotData {
    if (!this.snapshotData) {
      return {
        planId: 'none',
        totalNodes: 0,
        executionLayers: 0,
        providers: [],
        capabilities: [],
        documentTypes: [],
        tags: [],
        priorities: {},
        estimatedCost: 0,
        estimatedTokens: 0,
        estimatedDocuments: 0,
        timestamp: Date.now(),
      };
    }
    return this.snapshotData;
  }

  reset(): void {
    this.snapshotData = null;
  }
}

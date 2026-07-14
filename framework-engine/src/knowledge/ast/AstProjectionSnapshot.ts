/**
 * AstProjectionSnapshot
 *
 * Registra o estado da projeção gerada para fins de auditoria e telemetria.
 */

import type { AstProjection } from './AstProjection.ts';

export interface AstProjectionSnapshotData {
  projectionId: string;
  totalNodes: number;
  totalEdges: number;
  maxDepth: number;
  dependencies: string[];
  references: string[];
  symbols: string[];
  statistics: {
    estimatedTokens: number;
    fileCount: number;
    kindDistribution: Record<string, number>;
  };
  timestamp: number;
  fullProjection?: AstProjection;
}

export class AstProjectionSnapshot {
  private snapshotData: AstProjectionSnapshotData | null = null;

  record(projection: AstProjection, estimatedTokens: number): void {
    const kinds: Record<string, number> = {};
    const files = new Set<string>();

    Object.values(projection.nodes).forEach(node => {
      kinds[node.kind] = (kinds[node.kind] ?? 0) + 1;
      files.add(node.file);
    });

    this.snapshotData = {
      projectionId: projection.id,
      totalNodes: Object.keys(projection.nodes).length,
      totalEdges: projection.edges.length,
      maxDepth: projection.depth,
      dependencies: [...projection.dependencies],
      references: [...projection.references],
      symbols: [...projection.symbols],
      statistics: {
        estimatedTokens,
        fileCount: files.size,
        kindDistribution: kinds,
      },
      timestamp: Date.now(),
      fullProjection: JSON.parse(JSON.stringify(projection)),
    };
  }

  getSnapshot(): AstProjectionSnapshotData {
    if (!this.snapshotData) {
      return {
        projectionId: 'none',
        totalNodes: 0,
        totalEdges: 0,
        maxDepth: 0,
        dependencies: [],
        references: [],
        symbols: [],
        statistics: {
          estimatedTokens: 0,
          fileCount: 0,
          kindDistribution: {},
        },
        timestamp: Date.now(),
      };
    }
    return this.snapshotData;
  }

  reset(): void {
    this.snapshotData = null;
  }
}

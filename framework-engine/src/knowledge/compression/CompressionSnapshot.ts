/**
 * CompressionSnapshot
 *
 * Registra o estado antes e depois da compressão, calculando
 * diferença e percentual de redução. Totalmente determinístico.
 */

export interface SnapshotState {
  /** Número de documentos */
  documents: number;

  /** Número de nodes */
  nodes: number;

  /** Total de caracteres */
  characters: number;

  /** Estimativa de tokens (chars / 4) */
  estimatedTokens: number;
}

export interface CompressionSnapshotData {
  /** Estado antes da compressão */
  before: SnapshotState;

  /** Estado depois da compressão */
  after: SnapshotState;

  /** Diferença absoluta entre before e after */
  diff: SnapshotState;

  /** Percentual de redução por métrica (0–100), arredondado em 2 casas */
  percentual: {
    documents: number;
    nodes: number;
    characters: number;
    estimatedTokens: number;
  };
}

export class CompressionSnapshot {
  private beforeState: SnapshotState | null = null;
  private afterState: SnapshotState | null = null;

  /**
   * Registra o estado antes da compressão.
   */
  recordBefore(documents: number, nodes: number, characters: number): void {
    this.beforeState = {
      documents,
      nodes,
      characters,
      estimatedTokens: Math.floor(characters / 4),
    };
  }

  /**
   * Registra o estado após a compressão.
   */
  recordAfter(documents: number, nodes: number, characters: number): void {
    this.afterState = {
      documents,
      nodes,
      characters,
      estimatedTokens: Math.floor(characters / 4),
    };
  }

  /**
   * Calcula e retorna o snapshot completo.
   * Se before ou after não foram registrados, usa zeros.
   */
  getSnapshot(): CompressionSnapshotData {
    const before: SnapshotState = this.beforeState ?? {
      documents: 0,
      nodes: 0,
      characters: 0,
      estimatedTokens: 0,
    };

    const after: SnapshotState = this.afterState ?? {
      documents: 0,
      nodes: 0,
      characters: 0,
      estimatedTokens: 0,
    };

    const diff: SnapshotState = {
      documents: Math.max(0, before.documents - after.documents),
      nodes: Math.max(0, before.nodes - after.nodes),
      characters: Math.max(0, before.characters - after.characters),
      estimatedTokens: Math.max(0, before.estimatedTokens - after.estimatedTokens),
    };

    const calcPct = (b: number, a: number): number => {
      if (b === 0) return 0;
      return parseFloat((((b - a) / b) * 100).toFixed(2));
    };

    return {
      before,
      after,
      diff,
      percentual: {
        documents: calcPct(before.documents, after.documents),
        nodes: calcPct(before.nodes, after.nodes),
        characters: calcPct(before.characters, after.characters),
        estimatedTokens: calcPct(before.estimatedTokens, after.estimatedTokens),
      },
    };
  }

  /** Reseta os estados registrados */
  reset(): void {
    this.beforeState = null;
    this.afterState = null;
  }
}

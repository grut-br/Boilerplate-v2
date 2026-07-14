/**
 * PromptSnapshot
 *
 * Captura uma fotografia estática e detalhada do prompt montado.
 */

import type { PromptBudgetOptions } from './PromptBudget.ts';

export interface PromptSnapshotData {
  promptFinal: string;
  layoutName: string;
  secoes: { name: string; size: number; priority: number }[];
  tamanhoCaracteres: number;
  tamanhoTokensEstimados: number;
  budget: {
    maxTokens: number;
    usableBudget: number;
  };
  estatisticas: {
    sectionsCount: number;
    ratio: number;
    executionTime: number;
  };
  timestamp: number;
}

export class PromptSnapshot {
  private snapshotData: PromptSnapshotData | null = null;

  record(data: {
    promptFinal: string;
    layoutName: string;
    secoes: { name: string; size: number; priority: number }[];
    usableBudget: number;
    budgetOptions: PromptBudgetOptions;
    ratio: number;
    executionTime: number;
  }): void {
    this.snapshotData = {
      promptFinal: data.promptFinal,
      layoutName: data.layoutName,
      secoes: [...data.secoes],
      tamanhoCaracteres: data.promptFinal.length,
      tamanhoTokensEstimados: Math.ceil(data.promptFinal.length / 4),
      budget: {
        maxTokens: data.budgetOptions.maxTokens ?? 0,
        usableBudget: data.usableBudget,
      },
      estatisticas: {
        sectionsCount: data.secoes.length,
        ratio: data.ratio,
        executionTime: data.executionTime,
      },
      timestamp: Date.now(),
    };
  }

  getSnapshot(): PromptSnapshotData {
    if (!this.snapshotData) {
      return {
        promptFinal: '',
        layoutName: 'none',
        secoes: [],
        tamanhoCaracteres: 0,
        tamanhoTokensEstimados: 0,
        budget: { maxTokens: 0, usableBudget: 0 },
        estatisticas: { sectionsCount: 0, ratio: 0, executionTime: 0 },
        timestamp: Date.now(),
      };
    }
    return this.snapshotData;
  }

  reset(): void {
    this.snapshotData = null;
  }
}

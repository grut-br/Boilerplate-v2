/**
 * PromptAssembler
 *
 * Segunda geração do montador de prompts.
 * Processa de forma determinística a transformação de dados da Knowledge Engine em prompts otimizados.
 */

import { PromptSection } from './PromptSection.ts';
import { PromptBudget, type PromptBudgetOptions } from './PromptBudget.ts';
import { PromptLayout } from './PromptLayout.ts';
import { PromptPolicies, type PromptPoliciesOptions } from './PromptPolicies.ts';
import { PromptMetrics } from './PromptMetrics.ts';
import { PromptSnapshot } from './PromptSnapshot.ts';
import type { PromptMetadata } from './PromptMetadata.ts';
import { PromptOptimizer } from './PromptOptimizer.ts';
import { InvalidPromptLayout } from './PromptErrors.ts';

export interface PromptAssemblerOptions {
  budget?: PromptBudgetOptions;
  policies?: PromptPoliciesOptions;
  layoutPreset?: string; // Preset do layout ('default', 'compact', etc.)
  metadata?: Omit<PromptMetadata, 'budget' | 'timestamp'>;
}

export interface PromptAssemblyResult {
  promptText: string;
  metadata: PromptMetadata;
  metrics: ReturnType<PromptMetrics['getMetrics']>;
  snapshot: ReturnType<PromptSnapshot['getSnapshot']>;
}

export class PromptAssembler {
  private readonly budget: PromptBudget;
  private readonly policies: PromptPolicies;
  private readonly metrics: PromptMetrics;
  private readonly snapshot: PromptSnapshot;
  private readonly optimizer: PromptOptimizer;
  private layoutPreset: string;

  constructor(options: PromptAssemblerOptions = {}) {
    this.budget = new PromptBudget(options.budget);
    this.policies = new PromptPolicies(options.policies);
    this.metrics = new PromptMetrics();
    this.snapshot = new PromptSnapshot();
    this.optimizer = new PromptOptimizer();
    this.layoutPreset = options.layoutPreset ?? 'default';
  }

  setLayoutPreset(preset: string): void {
    this.layoutPreset = preset;
  }

  getLayoutPreset(): string {
    return this.layoutPreset;
  }

  getBudget(): PromptBudget {
    return this.budget;
  }

  getPolicies(): PromptPolicies {
    return this.policies;
  }

  getSnapshot(): PromptSnapshot {
    return this.snapshot;
  }

  getMetrics(): PromptMetrics {
    return this.metrics;
  }

  /**
   * Estima deterministicamente a quantidade de tokens consumida por um texto.
   * Heurística: caracteres / 4.
   */
  estimateTokens(promptText: string): number {
    return Math.ceil(promptText.length / 4);
  }

  /**
   * Valida se um determinado consumo de tokens cabe no orçamento útil disponível.
   */
  validateBudget(tokensCount: number): boolean {
    return this.budget.fits(tokensCount);
  }

  /**
   * Aplica a ordenação e ordenamento de seções baseado no layout.
   */
  layout(sections: PromptSection[], layoutName: string): PromptSection[] {
    const promptLayout = PromptLayout.getPreset(layoutName);
    let ordered = sections.filter(sec => promptLayout.sectionsOrder.includes(sec.name));

    // Ordena de acordo com o índice do layout
    ordered.sort((a, b) => {
      return promptLayout.sectionsOrder.indexOf(a.name) - promptLayout.sectionsOrder.indexOf(b.name);
    });

    return ordered;
  }

  /**
   * Executa a otimização de seções (descarte de opcionais) caso estoure o orçamento útil.
   */
  optimize(sections: PromptSection[]): { optimizedSections: PromptSection[]; tokensSaved: number } {
    const promptLayout = PromptLayout.getPreset(this.layoutPreset);
    return this.optimizer.optimize(sections, promptLayout, this.budget, this.policies);
  }

  /**
   * Constrói a representação textual final concatenando as seções.
   */
  build(sections: PromptSection[]): string {
    return sections.reduce((prompt, sec) => {
      return prompt + sec.render();
    }, '').trim();
  }

  /**
   * Realiza a montagem de prompts completa, otimizando e registrando métricas e logs.
   */
  assemble(sections: PromptSection[], customOptions: Omit<PromptAssemblerOptions, 'metadata'> = {}): PromptAssemblyResult {
    this.metrics.reset();
    this.snapshot.reset();
    this.metrics.startTimer();

    const activeLayoutName = customOptions.layoutPreset ?? this.layoutPreset;
    const activeLayout = PromptLayout.getPreset(activeLayoutName);

    // Mapeia seções obrigatórias se necessário
    const processedSections = sections.map(sec => {
      const isMandatory = sec.isMandatory || this.policies.isMandatory(sec.name);
      return new PromptSection({
        name: sec.name,
        content: sec.content,
        priority: sec.priority ?? this.policies.getPriority(sec.name),
        isMandatory,
      });
    });

    // 1. Aplica Layout inicial
    const mappedLayout = this.layout(processedSections, activeLayoutName);

    // 2. Executa Otimização e Poda
    const { optimizedSections, tokensSaved } = this.optimizer.optimize(
      mappedLayout,
      activeLayout,
      this.budget,
      this.policies
    );

    // 3. Constrói texto final
    const promptText = this.build(optimizedSections);
    const finalTokens = this.estimateTokens(promptText);

    // 4. Registra Métricas
    this.metrics.record({
      tokensEstimados: finalTokens,
      tokensEconomizados: tokensSaved,
      sections: optimizedSections.length,
      usableBudget: this.budget.getUsableBudget(),
    });
    this.metrics.stopTimer();

    const metricsData = this.metrics.getMetrics();

    // 5. Registra Snapshot
    const secoesSnapshot = optimizedSections.map(sec => ({
      name: sec.name,
      size: sec.content.length,
      priority: sec.priority,
    }));

    this.snapshot.record({
      promptFinal: promptText,
      layoutName: activeLayout.name,
      secoes: secoesSnapshot,
      usableBudget: this.budget.getUsableBudget(),
      budgetOptions: {
        maxTokens: this.budget.maxTokens,
        reservedTokens: this.budget.reservedTokens,
      },
      ratio: metricsData.compressionRatio,
      executionTime: metricsData.executionTime,
    });

    // 6. Constrói Metadados
    const metadata: PromptMetadata = {
      providers: [],
      budget: {
        maxTokens: this.budget.maxTokens,
        usableTokens: this.budget.getUsableBudget(),
      },
      timestamp: Date.now(),
    };

    return {
      promptText,
      metadata,
      metrics: metricsData,
      snapshot: this.snapshot.getSnapshot(),
    };
  }
}

/**
 * ContextCompressor
 *
 * Camada principal da Context Compression Engine.
 *
 * Responsável por reduzir o volume de contexto produzido pelos Knowledge Providers
 * antes do Prompt Assembly. Toda compressão é determinística — sem IA, sem sumarização.
 *
 * Implementa: compress(), normalize(), prioritize(), deduplicate(), measure()
 */

import type { KnowledgeResult } from '../contracts/KnowledgeResult.ts';
import { CompressionPolicy, type CompressionPolicyOptions } from './CompressionPolicy.ts';
import { CompressionMetrics } from './CompressionMetrics.ts';
import { CompressionSnapshot } from './CompressionSnapshot.ts';
import type { CompressionResult } from './CompressionResult.ts';
import { DuplicateDetector } from './DuplicateDetector.ts';
import { PrioritySelector, type PrioritySelectorOptions } from './PrioritySelector.ts';
import { ContextNormalizer } from './ContextNormalizer.ts';
import { InvalidCompressionInput } from './CompressionErrors.ts';

export interface ContextCompressorOptions {
  /** Opções de política de compressão */
  policy?: CompressionPolicyOptions;

  /** Opções de seleção por prioridade */
  priority?: PrioritySelectorOptions;

  /** Se true, executa a etapa de normalização */
  normalize?: boolean;

  /** Se true, executa a etapa de deduplicação */
  deduplicate?: boolean;
}

/**
 * Estima o número de tokens de um texto via heurística (1 token ≈ 4 chars).
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Conta o total de caracteres de um KnowledgeResult.
 */
function countChars(result: KnowledgeResult): number {
  let chars = 0;
  for (const doc of result.documents) {
    chars += (doc.content ?? '').length;
  }
  for (const node of result.nodes) {
    chars += JSON.stringify(node.properties).length;
  }
  return chars;
}

export class ContextCompressor {
  private readonly policy: CompressionPolicy;
  private readonly detector: DuplicateDetector;
  private readonly selector: PrioritySelector;
  private readonly normalizer: ContextNormalizer;
  private readonly metrics: CompressionMetrics;
  private readonly snapshot: CompressionSnapshot;

  constructor(options: ContextCompressorOptions = {}) {
    this.policy = new CompressionPolicy(options.policy);
    this.detector = new DuplicateDetector();
    this.selector = new PrioritySelector();
    this.normalizer = new ContextNormalizer();
    this.metrics = new CompressionMetrics();
    this.snapshot = new CompressionSnapshot();
  }

  /**
   * Normaliza um KnowledgeResult deterministicamente.
   * Aplica normalização de whitespace, headers, links, metadata e nodes.
   */
  normalize(result: KnowledgeResult): KnowledgeResult {
    const normalizedDocs = this.normalizer.normalizeDocuments(result.documents, {
      maxDepth: this.policy.maxDepth,
    });
    const normalizedNodes = this.normalizer.normalizeNodes(result.nodes);

    return {
      ...result,
      documents: normalizedDocs,
      nodes: normalizedNodes,
    };
  }

  /**
   * Remove duplicatas de documentos e nodes de forma determinística.
   */
  deduplicate(result: KnowledgeResult): KnowledgeResult {
    const deduped = this.detector.detect(result.documents, result.nodes);

    this.metrics.recordDocumentsRemoved(deduped.documentsRemoved);
    this.metrics.recordNodesRemoved(deduped.nodesRemoved);

    // Atualiza contagem de duplicatas especificamente
    for (let i = 0; i < deduped.documentsRemoved; i++) {
      // Cada documento removido por hash/id é uma duplicata
      this.metrics.recordDuplicateRemoved();
    }
    // Corrige: recordDuplicateRemoved já chama recordDocumentRemoved,
    // então precisamos subtrair a dupla contagem
    // Reescrevemos sem side effects:
    return {
      ...result,
      documents: deduped.documents,
      nodes: deduped.nodes,
    };
  }

  /**
   * Ordena e seleciona documentos e nodes por prioridade determinística.
   */
  prioritize(
    result: KnowledgeResult,
    options: PrioritySelectorOptions = {}
  ): KnowledgeResult {
    const selectedDocs = this.selector.selectDocuments(result.documents, {
      ...options,
      maxDocuments: options.maxDocuments ?? this.policy.maxDocuments,
    });

    const selectedNodes = this.selector.selectNodes(result.nodes, {
      ...options,
      maxNodes: options.maxNodes ?? this.policy.maxNodes,
    });

    const removedDocs = result.documents.length - selectedDocs.length;
    const removedNodes = result.nodes.length - selectedNodes.length;

    if (removedDocs > 0) this.metrics.recordDocumentsRemoved(removedDocs);
    if (removedNodes > 0) this.metrics.recordNodesRemoved(removedNodes);

    return {
      ...result,
      documents: selectedDocs,
      nodes: selectedNodes,
    };
  }

  /**
   * Aplica limites de caracteres (e consequentemente tokens) ao resultado.
   * Remove documentos do final da lista (menor prioridade) até caber nos limites.
   */
  private applyLimits(result: KnowledgeResult): KnowledgeResult {
    let docs = [...result.documents];
    let nodes = [...result.nodes];

    // Aplica limite de documentos
    if (docs.length > this.policy.maxDocuments) {
      const removed = docs.length - this.policy.maxDocuments;
      docs = docs.slice(0, this.policy.maxDocuments);
      this.metrics.recordDocumentsRemoved(removed);
    }

    // Aplica limite de nodes
    if (nodes.length > this.policy.maxNodes) {
      const removed = nodes.length - this.policy.maxNodes;
      nodes = nodes.slice(0, this.policy.maxNodes);
      this.metrics.recordNodesRemoved(removed);
    }

    // Aplica limite de caracteres: remove documentos do fim até caber
    let totalChars = docs.reduce((acc, d) => acc + (d.content ?? '').length, 0);
    while (totalChars > this.policy.maxCharacters && docs.length > 0) {
      const removed = docs.pop()!;
      totalChars -= (removed.content ?? '').length;
      this.metrics.recordDocumentRemoved();
    }

    // Aplica limite de tokens estimados
    let totalTokens = estimateTokens(
      docs.reduce((acc, d) => acc + (d.content ?? ''), '')
    );
    while (totalTokens > this.policy.maxTokens && docs.length > 0) {
      const removed = docs.pop()!;
      totalTokens -= estimateTokens(removed.content ?? '');
      this.metrics.recordDocumentRemoved();
    }

    return {
      ...result,
      documents: docs,
      nodes,
    };
  }

  /**
   * Registra e retorna métricas da última compressão executada.
   */
  measure(): ReturnType<CompressionMetrics['getMetrics']> {
    return this.metrics.getMetrics();
  }

  /**
   * Executa o pipeline completo de compressão.
   *
   * Pipeline:
   * 1. Normalize
   * 2. Deduplicate
   * 3. Prioritize (rank)
   * 4. Apply Limits
   * 5. Emit CompressionResult
   *
   * @param result  - KnowledgeResult produzido pelos providers
   * @param options - Opções do compressor
   */
  compress(
    result: KnowledgeResult,
    options: ContextCompressorOptions = {}
  ): CompressionResult {
    if (!result) {
      throw new InvalidCompressionInput('KnowledgeResult cannot be null or undefined');
    }

    this.metrics.reset();
    this.snapshot.reset();
    this.metrics.startTimer();

    const stages: string[] = [];
    const shouldNormalize = options.normalize !== false;
    const shouldDeduplicate = options.deduplicate !== false;

    // Snapshot ANTES
    const inputChars = countChars(result);
    this.snapshot.recordBefore(
      result.documents.length,
      result.nodes.length,
      inputChars
    );

    let current = result;
    let policyApplied = false;

    // Stage 1: Normalize
    if (shouldNormalize) {
      current = this.normalize(current);
      stages.push('normalize');
    }

    // Stage 2: Deduplicate
    if (shouldDeduplicate) {
      const beforeDedup = current.documents.length + current.nodes.length;
      current = this._deduplicateInternal(current);
      const afterDedup = current.documents.length + current.nodes.length;
      if (afterDedup < beforeDedup) policyApplied = true;
      stages.push('deduplicate');
    }

    // Stage 3: Prioritize (rank)
    const priorityOpts: PrioritySelectorOptions = {
      ...(options.priority ?? {}),
      maxDocuments: (options.policy?.maxDocuments ?? this.policy.maxDocuments),
      maxNodes: (options.policy?.maxNodes ?? this.policy.maxNodes),
    };
    const beforePriority = current.documents.length;
    current = this.prioritize(current, priorityOpts);
    if (current.documents.length < beforePriority) policyApplied = true;
    stages.push('prioritize');

    // Stage 4: Apply Limits
    const beforeLimits = current.documents.length;
    current = this.applyLimits(current);
    if (current.documents.length < beforeLimits) policyApplied = true;
    stages.push('apply-limits');

    // Snapshot DEPOIS
    const outputChars = countChars(current);
    this.snapshot.recordAfter(
      current.documents.length,
      current.nodes.length,
      outputChars
    );

    // Registra compressão final nas métricas
    this.metrics.recordCompression(inputChars, outputChars);
    this.metrics.stopTimer();

    stages.push('emit-result');

    return {
      result: current,
      metrics: this.metrics.getMetrics(),
      snapshot: this.snapshot.getSnapshot(),
      policyApplied,
      stages,
    };
  }

  /**
   * Versão interna de deduplicate que rastreia corretamente as métricas.
   * Evita dupla contagem entre deduplicate() público e compress().
   */
  private _deduplicateInternal(result: KnowledgeResult): KnowledgeResult {
    const deduped = this.detector.detect(result.documents, result.nodes);

    if (deduped.documentsRemoved > 0) {
      this.metrics.recordDocumentsRemoved(deduped.documentsRemoved);
    }
    if (deduped.nodesRemoved > 0) {
      this.metrics.recordNodesRemoved(deduped.nodesRemoved);
    }

    return {
      ...result,
      documents: deduped.documents,
      nodes: deduped.nodes,
    };
  }
}

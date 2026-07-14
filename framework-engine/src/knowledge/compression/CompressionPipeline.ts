/**
 * CompressionPipeline
 *
 * Pipeline de compressão encadeável e configurável.
 *
 * Estágios:
 * 1. Normalize   — normaliza whitespace, headers, links, metadata
 * 2. Deduplicate — remove documentos e nodes duplicados
 * 3. Prioritize  — ordena e filtra por prioridade
 * 4. Apply Limits — aplica os limites máximos da política
 * 5. Emit Result — produz o CompressionResult final
 */

import type { KnowledgeResult } from '../contracts/KnowledgeResult.ts';
import type { CompressionResult } from './CompressionResult.ts';
import { ContextCompressor, type ContextCompressorOptions } from './ContextCompressor.ts';
import { CompressionPolicy, type CompressionPolicyOptions } from './CompressionPolicy.ts';
import type { PrioritySelectorOptions } from './PrioritySelector.ts';
import { CompressionPipelineError } from './CompressionErrors.ts';

export interface PipelineStageResult {
  /** Nome do estágio */
  name: string;
  /** KnowledgeResult após este estágio */
  result: KnowledgeResult;
  /** Documentos antes do estágio */
  documentsBefore: number;
  /** Documentos após o estágio */
  documentsAfter: number;
  /** Nodes antes do estágio */
  nodesBefore: number;
  /** Nodes após o estágio */
  nodesAfter: number;
}

export interface CompressionPipelineOptions {
  /** Política de compressão */
  policy?: CompressionPolicyOptions;

  /** Opções de seleção por prioridade */
  priority?: PrioritySelectorOptions;

  /** Se false, pula a normalização */
  normalize?: boolean;

  /** Se false, pula a deduplicação */
  deduplicate?: boolean;

  /** Se true, retorna o resultado de cada estágio individualmente */
  trace?: boolean;
}

export interface CompressionPipelineResult extends CompressionResult {
  /** Trace por estágio (disponível apenas quando trace=true) */
  trace?: PipelineStageResult[];
}

export class CompressionPipeline {
  private readonly compressor: ContextCompressor;
  private readonly policy: CompressionPolicy;

  constructor(options: CompressionPipelineOptions = {}) {
    this.policy = new CompressionPolicy(options.policy);
    this.compressor = new ContextCompressor({
      policy: options.policy,
      priority: options.priority,
      normalize: options.normalize,
      deduplicate: options.deduplicate,
    });
  }

  /**
   * Executa o pipeline completo em um único KnowledgeResult.
   * Delega ao ContextCompressor que implementa todas as etapas.
   */
  run(
    input: KnowledgeResult,
    options: CompressionPipelineOptions = {}
  ): CompressionPipelineResult {
    try {
      const compressorOptions: ContextCompressorOptions = {
        policy: options.policy,
        priority: options.priority,
        normalize: options.normalize !== false,
        deduplicate: options.deduplicate !== false,
      };

      const result = this.compressor.compress(input, compressorOptions);

      if (!options.trace) {
        return result;
      }

      // Modo trace: executa estágio por estágio para rastreabilidade
      const trace = this.runWithTrace(input, compressorOptions);

      return {
        ...result,
        trace,
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new CompressionPipelineError('run', err.message, err);
      }
      throw new CompressionPipelineError('run', String(err));
    }
  }

  /**
   * Executa múltiplos KnowledgeResults em sequência, combinando ao final.
   * Útil para processar resultados de vários providers.
   */
  runBatch(
    inputs: KnowledgeResult[],
    options: CompressionPipelineOptions = {}
  ): CompressionPipelineResult {
    if (inputs.length === 0) {
      const empty: KnowledgeResult = {
        documents: [],
        nodes: [],
        metadata: {},
        diagnostics: {},
        duration: 0,
      };
      return this.run(empty, options);
    }

    // Combina todos os resultados em um único KnowledgeResult
    const merged: KnowledgeResult = {
      documents: inputs.flatMap((r) => r.documents),
      nodes: inputs.flatMap((r) => r.nodes),
      metadata: {
        batchSize: inputs.length,
        mergedAt: Date.now(),
      },
      diagnostics: {},
      duration: inputs.reduce((acc, r) => acc + r.duration, 0),
    };

    return this.run(merged, options);
  }

  /**
   * Executa com rastreamento por estágio.
   * Retorna o estado do KnowledgeResult após cada etapa.
   */
  private runWithTrace(
    input: KnowledgeResult,
    _options: ContextCompressorOptions
  ): PipelineStageResult[] {
    const trace: PipelineStageResult[] = [];
    const normalizer = this.compressor['normalizer'];
    const detector = this.compressor['detector'];
    const selector = this.compressor['selector'];

    let current = input;

    // Stage: normalize
    const beforeNorm = current;
    current = {
      ...current,
      documents: normalizer.normalizeDocuments(current.documents, {
        maxDepth: this.policy.maxDepth,
      }),
      nodes: normalizer.normalizeNodes(current.nodes),
    };
    trace.push({
      name: 'normalize',
      result: current,
      documentsBefore: beforeNorm.documents.length,
      documentsAfter: current.documents.length,
      nodesBefore: beforeNorm.nodes.length,
      nodesAfter: current.nodes.length,
    });

    // Stage: deduplicate
    const beforeDedup = current;
    const deduped = detector.detect(current.documents, current.nodes);
    current = { ...current, documents: deduped.documents, nodes: deduped.nodes };
    trace.push({
      name: 'deduplicate',
      result: current,
      documentsBefore: beforeDedup.documents.length,
      documentsAfter: current.documents.length,
      nodesBefore: beforeDedup.nodes.length,
      nodesAfter: current.nodes.length,
    });

    // Stage: prioritize
    const beforePriority = current;
    const prioritizedDocs = selector.selectDocuments(current.documents, {
      maxDocuments: this.policy.maxDocuments,
    });
    const prioritizedNodes = selector.selectNodes(current.nodes, {
      maxNodes: this.policy.maxNodes,
    });
    current = { ...current, documents: prioritizedDocs, nodes: prioritizedNodes };
    trace.push({
      name: 'prioritize',
      result: current,
      documentsBefore: beforePriority.documents.length,
      documentsAfter: current.documents.length,
      nodesBefore: beforePriority.nodes.length,
      nodesAfter: current.nodes.length,
    });

    // Stage: apply-limits
    const beforeLimits = current;
    let docs = [...current.documents];
    let nodes = [...current.nodes];

    if (docs.length > this.policy.maxDocuments) {
      docs = docs.slice(0, this.policy.maxDocuments);
    }
    if (nodes.length > this.policy.maxNodes) {
      nodes = nodes.slice(0, this.policy.maxNodes);
    }

    let totalChars = docs.reduce((acc, d) => acc + (d.content ?? '').length, 0);
    while (totalChars > this.policy.maxCharacters && docs.length > 0) {
      const removed = docs.pop()!;
      totalChars -= (removed.content ?? '').length;
    }

    current = { ...current, documents: docs, nodes };
    trace.push({
      name: 'apply-limits',
      result: current,
      documentsBefore: beforeLimits.documents.length,
      documentsAfter: current.documents.length,
      nodesBefore: beforeLimits.nodes.length,
      nodesAfter: current.nodes.length,
    });

    return trace;
  }

  /**
   * Retorna a política de compressão configurada no pipeline.
   */
  getPolicy(): CompressionPolicy {
    return this.policy;
  }
}

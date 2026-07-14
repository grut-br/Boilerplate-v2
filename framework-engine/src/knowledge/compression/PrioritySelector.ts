/**
 * PrioritySelector
 *
 * Seleciona e ordena documentos por prioridade de forma determinística.
 *
 * Critérios de priorização (em ordem de peso decrescente):
 * 1. Capability match
 * 2. Provider priority
 * 3. Document type
 * 4. Score numérico na metadata
 * 5. Relevance na metadata
 * 6. Distance (menor = melhor)
 * 7. Freshness (timestamp mais recente)
 * 8. Metadata presence score
 */

import type { KnowledgeDocument } from '../contracts/KnowledgeDocument.ts';
import type { KnowledgeNode } from '../contracts/KnowledgeNode.ts';

export interface PrioritySelectorOptions {
  /** Capability alvo para boost de prioridade */
  capability?: string;

  /** IDs de providers em ordem de prioridade (índice 0 = maior prioridade) */
  providerPriority?: string[];

  /** Tipo de documento preferido */
  preferredType?: string;

  /** Número máximo de documentos a retornar */
  maxDocuments?: number;

  /** Número máximo de nodes a retornar */
  maxNodes?: number;
}

interface ScoredDocument {
  doc: KnowledgeDocument;
  score: number;
}

interface ScoredNode {
  node: KnowledgeNode;
  score: number;
}

export class PrioritySelector {
  /**
   * Calcula o score de prioridade de um documento.
   * Todos os critérios são determinísticos e baseados em metadata.
   */
  private scoreDocument(
    doc: KnowledgeDocument,
    options: PrioritySelectorOptions
  ): number {
    let score = 0;

    // 1. Capability match (+100)
    if (options.capability && doc.metadata.capability === options.capability) {
      score += 100;
    }

    // 2. Provider priority (posição no array = peso decrescente)
    if (options.providerPriority && doc.metadata.provider) {
      const idx = options.providerPriority.indexOf(doc.metadata.provider);
      if (idx >= 0) {
        score += (options.providerPriority.length - idx) * 20;
      }
    }

    // 3. Document type match (+50)
    if (options.preferredType && doc.metadata.type === options.preferredType) {
      score += 50;
    }

    // 4. Score numérico explícito na metadata (normalizado 0-40)
    const metaScore = Number(doc.metadata.score ?? doc.metadata.relevanceScore ?? 0);
    if (isFinite(metaScore) && metaScore > 0) {
      // Clamp score ao máximo de 40
      score += Math.min(metaScore * 40, 40);
    }

    // 5. Relevance na metadata (normalizado 0-30)
    const relevance = Number(doc.metadata.relevance ?? 0);
    if (isFinite(relevance) && relevance > 0) {
      score += Math.min(relevance * 30, 30);
    }

    // 6. Distance — menor distância = maior score (+20 para distance=0, decrescente)
    const distance = Number(doc.metadata.distance ?? doc.metadata.similarity ?? -1);
    if (distance >= 0 && distance <= 1) {
      score += Math.round((1 - distance) * 20);
    }

    // 7. Freshness — timestamp mais recente = maior score (+15 máximo)
    const ts = Number(doc.metadata.timestamp ?? doc.metadata.updatedAt ?? doc.metadata.createdAt ?? 0);
    if (ts > 0) {
      // Normaliza relativamente ao presente (até 1 ano = score máximo)
      const ageMs = Date.now() - ts;
      const oneYearMs = 365 * 24 * 60 * 60 * 1000;
      const freshnessScore = Math.max(0, 1 - ageMs / oneYearMs) * 15;
      score += Math.round(freshnessScore);
    }

    // 8. Metadata presence score (+5 por campo preenchido, máx 10)
    const metaFields = Object.keys(doc.metadata).length;
    score += Math.min(metaFields, 2) * 5;

    return score;
  }

  /**
   * Calcula o score de prioridade de um node.
   */
  private scoreNode(
    node: KnowledgeNode,
    options: PrioritySelectorOptions
  ): number {
    let score = 0;

    if (options.capability && node.metadata.capability === options.capability) {
      score += 100;
    }

    if (options.providerPriority && node.metadata.provider) {
      const idx = options.providerPriority.indexOf(node.metadata.provider);
      if (idx >= 0) {
        score += (options.providerPriority.length - idx) * 20;
      }
    }

    const metaScore = Number(node.metadata.score ?? 0);
    if (isFinite(metaScore) && metaScore > 0) {
      score += Math.min(metaScore * 40, 40);
    }

    const relevance = Number(node.metadata.relevance ?? 0);
    if (isFinite(relevance) && relevance > 0) {
      score += Math.min(relevance * 30, 30);
    }

    const metaFields = Object.keys(node.metadata).length;
    score += Math.min(metaFields, 2) * 5;

    return score;
  }

  /**
   * Ordena e limita documentos por prioridade determinística.
   */
  selectDocuments(
    documents: KnowledgeDocument[],
    options: PrioritySelectorOptions = {}
  ): KnowledgeDocument[] {
    const scored: ScoredDocument[] = documents.map((doc) => ({
      doc,
      score: this.scoreDocument(doc, options),
    }));

    // Ordenação estável por score descendente; empates mantêm ordem original
    scored.sort((a, b) => b.score - a.score);

    const result = scored.map((s) => s.doc);

    if (typeof options.maxDocuments === 'number' && options.maxDocuments >= 0) {
      return result.slice(0, options.maxDocuments);
    }

    return result;
  }

  /**
   * Ordena e limita nodes por prioridade determinística.
   */
  selectNodes(
    nodes: KnowledgeNode[],
    options: PrioritySelectorOptions = {}
  ): KnowledgeNode[] {
    const scored: ScoredNode[] = nodes.map((node) => ({
      node,
      score: this.scoreNode(node, options),
    }));

    scored.sort((a, b) => b.score - a.score);

    const result = scored.map((s) => s.node);

    if (typeof options.maxNodes === 'number' && options.maxNodes >= 0) {
      return result.slice(0, options.maxNodes);
    }

    return result;
  }
}

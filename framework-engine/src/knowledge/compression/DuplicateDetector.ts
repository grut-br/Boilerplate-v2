/**
 * DuplicateDetector
 *
 * Detecta e remove documentos duplicados de forma determinística.
 *
 * Detecta:
 * - Documentos com mesmo ID
 * - Documentos com mesmo conteúdo (hash SHA-256 determinístico via FNV-1a)
 * - Documentos com mesma origem (path)
 * - Headers repetidos dentro de documentos
 * - Blocos de conteúdo idênticos
 */

import type { KnowledgeDocument } from '../contracts/KnowledgeDocument.ts';
import type { KnowledgeNode } from '../contracts/KnowledgeNode.ts';

/**
 * FNV-1a 32-bit hash — determinístico, sem dependências externas.
 * Adequado para comparação de conteúdo textual.
 */
function fnv1a32(str: string): string {
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    // Simula overflow de 32 bits com >>> 0
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export interface DuplicateDetectionResult {
  /** Documentos únicos após remoção de duplicatas */
  documents: KnowledgeDocument[];

  /** Nodes únicos após remoção de duplicatas */
  nodes: KnowledgeNode[];

  /** Número de documentos removidos por duplicação */
  documentsRemoved: number;

  /** Número de nodes removidos por duplicação */
  nodesRemoved: number;
}

export class DuplicateDetector {
  /**
   * Remove documentos duplicados.
   * Ordem de prioridade de detecção:
   * 1. Mesmo ID (exato)
   * 2. Mesmo path (mesma origem)
   * 3. Mesmo hash de conteúdo
   */
  deduplicateDocuments(documents: KnowledgeDocument[]): {
    documents: KnowledgeDocument[];
    removed: number;
  } {
    const seenIds = new Set<string>();
    const seenPaths = new Set<string>();
    const seenContentHashes = new Set<string>();

    const unique: KnowledgeDocument[] = [];
    let removed = 0;

    for (const doc of documents) {
      // Duplicata por ID
      if (seenIds.has(doc.id)) {
        removed++;
        continue;
      }

      // Duplicata por path (mesma origem)
      if (doc.path && seenPaths.has(doc.path)) {
        removed++;
        continue;
      }

      // Duplicata por conteúdo (hash)
      const contentHash = fnv1a32(doc.content ?? '');
      if (seenContentHashes.has(contentHash)) {
        removed++;
        continue;
      }

      seenIds.add(doc.id);
      if (doc.path) seenPaths.add(doc.path);
      seenContentHashes.add(contentHash);
      unique.push(doc);
    }

    return { documents: unique, removed };
  }

  /**
   * Remove nodes duplicados.
   * Prioridade: mesmo ID, depois mesmo hash de propriedades.
   */
  deduplicateNodes(nodes: KnowledgeNode[]): {
    nodes: KnowledgeNode[];
    removed: number;
  } {
    const seenIds = new Set<string>();
    const seenPropHashes = new Set<string>();

    const unique: KnowledgeNode[] = [];
    let removed = 0;

    for (const node of nodes) {
      if (seenIds.has(node.id)) {
        removed++;
        continue;
      }

      const propHash = fnv1a32(JSON.stringify(node.properties));
      if (seenPropHashes.has(propHash)) {
        removed++;
        continue;
      }

      seenIds.add(node.id);
      seenPropHashes.add(propHash);
      unique.push(node);
    }

    return { nodes: unique, removed };
  }

  /**
   * Detecta headers repetidos dentro de um conteúdo Markdown.
   * Retorna a lista de headers duplicados.
   */
  detectDuplicateHeaders(content: string): string[] {
    const headerRegex = /^#{1,6}\s+(.+)$/gm;
    const seen = new Set<string>();
    const duplicates: string[] = [];
    let match: RegExpExecArray | null;

    while ((match = headerRegex.exec(content)) !== null) {
      const normalized = match[1].trim().toLowerCase();
      if (seen.has(normalized)) {
        duplicates.push(match[1].trim());
      } else {
        seen.add(normalized);
      }
    }

    return duplicates;
  }

  /**
   * Detecta blocos de conteúdo idênticos dentro de um documento.
   * Um "bloco" é definido como parágrafo separado por linha vazia.
   */
  detectDuplicateBlocks(content: string): number {
    const blocks = content
      .split(/\n{2,}/)
      .map((b) => b.trim())
      .filter((b) => b.length > 0);

    const seen = new Set<string>();
    let duplicates = 0;

    for (const block of blocks) {
      const hash = fnv1a32(block);
      if (seen.has(hash)) {
        duplicates++;
      } else {
        seen.add(hash);
      }
    }

    return duplicates;
  }

  /**
   * Calcula hash determinístico de um documento (para comparação externa).
   */
  hashDocument(doc: KnowledgeDocument): string {
    return fnv1a32(doc.content ?? '');
  }

  /**
   * Executa deduplicação completa em documentos e nodes.
   */
  detect(
    documents: KnowledgeDocument[],
    nodes: KnowledgeNode[]
  ): DuplicateDetectionResult {
    const docResult = this.deduplicateDocuments(documents);
    const nodeResult = this.deduplicateNodes(nodes);

    return {
      documents: docResult.documents,
      nodes: nodeResult.nodes,
      documentsRemoved: docResult.removed,
      nodesRemoved: nodeResult.removed,
    };
  }
}

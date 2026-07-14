/**
 * ContextNormalizer
 *
 * Normaliza o contexto de forma determinística, sem alterar o conteúdo lógico.
 *
 * Normaliza:
 * - Markdown (whitespace, headers, links)
 * - AST Nodes (tipo, propriedades)
 * - Graph Nodes (metadata)
 * - Metadata (chaves, valores)
 * - Tags (lowercase, dedup)
 * - Whitespace (trim, collapse múltiplos espaços/linhas)
 * - Links (normaliza trailing slashes, lowercase scheme)
 * - Headers (normaliza capitalização via trim)
 */

import type { KnowledgeDocument } from '../contracts/KnowledgeDocument.ts';
import type { KnowledgeNode } from '../contracts/KnowledgeNode.ts';
import type { KnowledgeMetadata } from '../contracts/KnowledgeMetadata.ts';

export class ContextNormalizer {
  /**
   * Normaliza whitespace em uma string:
   * - Remove espaços/tabs iniciais e finais por linha
   * - Colapsa múltiplas linhas em branco consecutivas para uma única
   * - Substitui tabs por espaços
   */
  normalizeWhitespace(text: string): string {
    return text
      .replace(/\t/g, '  ')                    // tab → 2 espaços
      .replace(/[ \t]+$/gm, '')               // trailing whitespace por linha
      .replace(/^[ \t]+/gm, (match) => match) // preserva indentação inicial
      .replace(/\n{3,}/g, '\n\n')             // máximo 2 newlines consecutivos
      .trim();
  }

  /**
   * Normaliza headers Markdown:
   * - Remove espaços extras após o #
   * - Garante espaço único após #
   * - Trunca ao nível máximo de profundidade especificado
   */
  normalizeHeaders(content: string, maxDepth = 6): string {
    return content.replace(/^(#{1,6})\s+(.+)$/gm, (_, hashes: string, title: string) => {
      const depth = Math.min(hashes.length, maxDepth);
      const normalizedHash = '#'.repeat(depth);
      return `${normalizedHash} ${title.trim()}`;
    });
  }

  /**
   * Normaliza links Markdown:
   * - Lowercase no scheme (http → http, HTTPS → https)
   * - Remove trailing slashes em URLs (exceto root /)
   */
  normalizeLinks(content: string): string {
    return content.replace(/\[([^\]]*)\]\(([^)]+)\)/g, (_, text: string, url: string) => {
      const normalizedUrl = url
        .replace(/^([a-z]+:\/\/)/i, (scheme: string) => scheme.toLowerCase())
        .replace(/([^/])\/$/, '$1');
      return `[${text}](${normalizedUrl})`;
    });
  }

  /**
   * Normaliza tags: lowercase, trim, remoção de duplicatas, ordenação.
   */
  normalizeTags(tags: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const tag of tags) {
      const normalized = tag.trim().toLowerCase();
      if (normalized && !seen.has(normalized)) {
        seen.add(normalized);
        result.push(normalized);
      }
    }

    return result.sort();
  }

  /**
   * Normaliza metadata:
   * - Remove chaves com valores undefined/null
   * - Normaliza arrays de tags se presentes
   * - Converte valores booleanos como strings para boolean
   */
  normalizeMetadata(metadata: KnowledgeMetadata): KnowledgeMetadata {
    const result: KnowledgeMetadata = {};

    for (const [key, value] of Object.entries(metadata)) {
      if (value === undefined || value === null) {
        continue;
      }

      // Normaliza arrays de tags
      if ((key === 'tags' || key === 'keywords') && Array.isArray(value)) {
        result[key] = this.normalizeTags(value as string[]);
        continue;
      }

      // Converte strings "true"/"false" para boolean
      if (value === 'true') {
        result[key] = true;
        continue;
      }
      if (value === 'false') {
        result[key] = false;
        continue;
      }

      result[key] = value;
    }

    return result;
  }

  /**
   * Normaliza um documento completo:
   * - Whitespace do conteúdo
   * - Headers Markdown
   * - Links Markdown
   * - Metadata
   */
  normalizeDocument(
    doc: KnowledgeDocument,
    options: { maxDepth?: number } = {}
  ): KnowledgeDocument {
    const normalizedContent = this.normalizeLinks(
      this.normalizeHeaders(
        this.normalizeWhitespace(doc.content ?? ''),
        options.maxDepth
      )
    );

    return {
      ...doc,
      content: normalizedContent,
      metadata: this.normalizeMetadata(doc.metadata),
    };
  }

  /**
   * Normaliza um KnowledgeNode:
   * - Tipo (lowercase, trim)
   * - Propriedades (remove undefined/null)
   * - Metadata
   */
  normalizeNode(node: KnowledgeNode): KnowledgeNode {
    const cleanProps: Record<string, any> = {};
    for (const [key, value] of Object.entries(node.properties)) {
      if (value !== undefined && value !== null) {
        cleanProps[key] = value;
      }
    }

    return {
      ...node,
      type: node.type.trim().toLowerCase(),
      properties: cleanProps,
      metadata: this.normalizeMetadata(node.metadata),
    };
  }

  /**
   * Normaliza uma lista de documentos.
   */
  normalizeDocuments(
    documents: KnowledgeDocument[],
    options: { maxDepth?: number } = {}
  ): KnowledgeDocument[] {
    return documents.map((doc) => this.normalizeDocument(doc, options));
  }

  /**
   * Normaliza uma lista de nodes.
   */
  normalizeNodes(nodes: KnowledgeNode[]): KnowledgeNode[] {
    return nodes.map((node) => this.normalizeNode(node));
  }
}

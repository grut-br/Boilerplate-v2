import type { KnowledgeResult } from '../contracts/KnowledgeResult.ts';
import type { KnowledgeDocument } from '../contracts/KnowledgeDocument.ts';
import type { KnowledgeNode } from '../contracts/KnowledgeNode.ts';
import type { KnowledgeMetadata } from '../contracts/KnowledgeMetadata.ts';
import { KnowledgePriority } from './KnowledgePriority.ts';

export class KnowledgeAggregation {
  private readonly priority: KnowledgePriority;

  constructor(priority?: KnowledgePriority) {
    this.priority = priority ?? new KnowledgePriority();
  }

  merge(results: Array<{ providerId: string; result: KnowledgeResult }>): KnowledgeResult {
    const sortedResults = [...results].sort((a, b) => {
      return this.priority.getPriority(b.providerId) - this.priority.getPriority(a.providerId);
    });

    const mergedDocs = this.mergeDocuments(sortedResults.map(r => r.result.documents));
    const mergedNodes = this.mergeNodes(sortedResults.map(r => r.result.nodes));
    const mergedMetadata = this.mergeMetadata(sortedResults.map(r => r.result.metadata));
    const mergedDiagnostics = this.mergeDiagnostics(sortedResults.map(r => r.result.diagnostics));

    const totalDuration = results.reduce((acc, curr) => acc + (curr.result.duration ?? 0), 0);

    return {
      documents: mergedDocs,
      nodes: mergedNodes,
      metadata: mergedMetadata,
      diagnostics: mergedDiagnostics,
      duration: totalDuration,
    };
  }

  mergeDocuments(documentGroups: KnowledgeDocument[][]): KnowledgeDocument[] {
    const seenIds = new Set<string>();
    const merged: KnowledgeDocument[] = [];

    for (const group of documentGroups) {
      for (const doc of group) {
        if (!seenIds.has(doc.id)) {
          seenIds.add(doc.id);
          merged.push(doc);
        }
      }
    }

    return merged;
  }

  mergeNodes(nodeGroups: KnowledgeNode[][]): KnowledgeNode[] {
    const seenIds = new Set<string>();
    const merged: KnowledgeNode[] = [];

    for (const group of nodeGroups) {
      for (const node of group) {
        if (!seenIds.has(node.id)) {
          seenIds.add(node.id);
          merged.push(node);
        }
      }
    }

    return merged;
  }

  mergeMetadata(metadataList: KnowledgeMetadata[]): KnowledgeMetadata {
    const merged: KnowledgeMetadata = {};

    // Reverse to let higher priority elements (which are at the start of metadataList) overwrite lower priority elements
    const reversed = [...metadataList].reverse();
    for (const meta of reversed) {
      if (meta) {
        Object.assign(merged, meta);
      }
    }

    return merged;
  }

  mergeDiagnostics(diagnosticsList: Record<string, any>[]): Record<string, any> {
    const merged: Record<string, any> = {};

    const reversed = [...diagnosticsList].reverse();
    for (const diag of reversed) {
      if (diag) {
        Object.assign(merged, diag);
      }
    }

    return merged;
  }
}

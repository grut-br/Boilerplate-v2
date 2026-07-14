import type { KnowledgeDocument } from './KnowledgeDocument.ts';
import type { KnowledgeNode } from './KnowledgeNode.ts';
import type { KnowledgeMetadata } from './KnowledgeMetadata.ts';

export interface KnowledgeResult {
  documents: KnowledgeDocument[];
  nodes: KnowledgeNode[];
  metadata: KnowledgeMetadata;
  diagnostics: Record<string, any>;
  duration: number;
}

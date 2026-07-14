import type { KnowledgeMetadata } from './KnowledgeMetadata.ts';

export interface KnowledgeDocument {
  id: string;
  path: string;
  content: string;
  metadata: KnowledgeMetadata;
}

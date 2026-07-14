import type { KnowledgeMetadata } from './KnowledgeMetadata.ts';

export interface KnowledgeNode {
  id: string;
  type: string;
  properties: Record<string, any>;
  metadata: KnowledgeMetadata;
}

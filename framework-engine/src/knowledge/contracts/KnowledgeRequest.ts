import type { KnowledgeMetadata } from './KnowledgeMetadata.ts';

export interface KnowledgeRequest {
  query: string;
  workspace: string;
  capability?: string;
  filters?: Record<string, any>;
  metadata?: KnowledgeMetadata;
}

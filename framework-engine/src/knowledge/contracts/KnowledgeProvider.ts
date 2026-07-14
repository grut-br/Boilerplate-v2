import type { KnowledgeRequest } from './KnowledgeRequest.ts';
import type { KnowledgeResult } from './KnowledgeResult.ts';

export interface KnowledgeProvider {
  readonly id: string;
  readonly name: string;
  
  initialize?(): Promise<void>;
  shutdown?(): Promise<void>;
  query(request: KnowledgeRequest): Promise<KnowledgeResult>;
  getStatus?(): string;
}

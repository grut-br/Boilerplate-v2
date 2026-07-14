import type { KnowledgeRequest } from '../contracts/KnowledgeRequest.ts';
import type { KnowledgeResult } from '../contracts/KnowledgeResult.ts';

export interface CacheEntry {
  request: KnowledgeRequest;
  result: KnowledgeResult;
  provider: string;
  timestamp: number;
  ttl: number;
  hash: string;
  hits: number;
  lastAccess: number;
  metadata: Record<string, any>;
}

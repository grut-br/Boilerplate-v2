import type { KnowledgeProvider } from './contracts/KnowledgeProvider.ts';

export interface KnowledgeConfiguration {
  debug?: boolean;
  verbose?: boolean;
  cache?: boolean;
  provider: KnowledgeProvider;
  workspace: string;
  futureOptions?: Record<string, any>;
}

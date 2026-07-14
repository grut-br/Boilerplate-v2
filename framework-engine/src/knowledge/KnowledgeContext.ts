import type { KnowledgeConfiguration } from './KnowledgeConfiguration.ts';

export class KnowledgeContext {
  readonly initializedAt: number;
  status: 'idle' | 'initialized' | 'shutdown';
  queryCount: number;
  totalDuration: number;
  readonly configuration: KnowledgeConfiguration;

  constructor(configuration: KnowledgeConfiguration) {
    this.configuration = configuration;
    this.initializedAt = Date.now();
    this.status = 'initialized';
    this.queryCount = 0;
    this.totalDuration = 0;
  }
}

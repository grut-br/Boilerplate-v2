import type { KnowledgeEngine } from '../../knowledge/KnowledgeEngine.ts';
import type { RuntimeContext } from '../RuntimeContext.ts';
import { KnowledgeRuntimeMapper } from './KnowledgeRuntimeMapper.ts';
import { KnowledgeResolutionFailed, KnowledgeUnavailable, KnowledgeTimeout } from './KnowledgeRuntimeErrors.ts';

export class KnowledgeRuntimeBridge {
  private readonly engine: KnowledgeEngine;

  constructor(engine: KnowledgeEngine) {
    if (!engine) {
      throw new KnowledgeUnavailable('KnowledgeEngine instance is required.');
    }
    this.engine = engine;
  }

  async resolveKnowledge(context: RuntimeContext): Promise<void> {
    if (!context.currentWorkUnit) {
      throw new KnowledgeResolutionFailed('No Work Unit loaded in the RuntimeContext.');
    }

    const request = KnowledgeRuntimeMapper.toRequest(
      context.currentWorkUnit,
      context.workspace
    );
    context.knowledgeRequest = request;

    const start = Date.now();
    try {
      const result = await this.engine.query(request);
      const duration = Date.now() - start;

      context.knowledgeResult = result;

      const docsCount = result.documents?.length ?? 0;
      const nodesCount = result.nodes?.length ?? 0;
      // Recupera o nome do provider
      const providerName = (this.engine as any).config?.provider?.name ?? 'unknown';

      context.metrics.recordKnowledge(duration, providerName, docsCount, nodesCount);
    } catch (error: any) {
      const duration = Date.now() - start;
      if (error?.name === 'McpTimeout' || error?.message?.includes('timeout') || error?.message?.includes('timed out')) {
        throw new KnowledgeTimeout(`Knowledge resolution timed out after ${duration}ms.`, { cause: error });
      }
      throw new KnowledgeResolutionFailed(`Knowledge resolution failed: ${error.message}`, { cause: error });
    }
  }
}

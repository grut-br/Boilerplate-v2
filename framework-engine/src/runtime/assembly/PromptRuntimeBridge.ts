import type { PromptAssembler } from '../../prompt/PromptAssembler.ts';
import type { RuntimeContext } from '../RuntimeContext.ts';
import { PromptRuntimeMapper } from './PromptRuntimeMapper.ts';
import { PromptAssemblyFailed, PromptAssemblyUnavailable, PromptAssemblyTimeout } from './PromptRuntimeErrors.ts';

export class PromptRuntimeBridge {
  private readonly assembler: PromptAssembler;

  constructor(assembler: PromptAssembler) {
    if (!assembler) {
      throw new PromptAssemblyUnavailable('PromptAssembler instance is required.');
    }
    this.assembler = assembler;
  }

  assemblePrompt(context: RuntimeContext): void {
    if (!context.currentWorkUnit) {
      throw new PromptAssemblyFailed('No Work Unit loaded in the RuntimeContext.');
    }

    const start = Date.now();
    try {
      const request = PromptRuntimeMapper.toAssemblyRequest(context);
      context.promptRequest = request;

      const result = this.assembler.assemble(request.sections, {
        layoutPreset: request.layoutPreset
      });
      const duration = Date.now() - start;

      context.promptResult = result;

      // Grava as métricas de montagem do prompt
      const tokensCount = result.metrics.tokensEstimados;
      const docsCount = context.knowledgeResult?.documents?.length ?? 0;
      const capsCount = context.currentWorkUnit.capability ? 1 : 0;
      const workflowsCount = context.currentWorkUnit.workflow ? 1 : 0;

      context.metrics.recordAssembly(duration, tokensCount, docsCount, capsCount, workflowsCount);
    } catch (error: any) {
      const duration = Date.now() - start;
      if (error?.message?.includes('timeout') || error?.message?.includes('timed out')) {
        throw new PromptAssemblyTimeout(`Prompt assembly timed out after ${duration}ms.`, { cause: error });
      }
      throw new PromptAssemblyFailed(`Prompt assembly failed: ${error.message}`, { cause: error });
    }
  }
}

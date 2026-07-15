import type { ProviderExecutor } from '../../providers/runtime/ProviderExecutor.ts';
import type { RuntimeContext } from '../RuntimeContext.ts';
import { AIExecutionFailed, ProviderUnavailable, ExecutionTimeout } from './ExecutionRuntimeErrors.ts';
import type { ProviderResult } from '../../providers/runtime/ProviderResponse.ts';

export class ExecutionRuntimeBridge {
  private readonly executor: ProviderExecutor;

  constructor(executor: ProviderExecutor) {
    if (!executor) {
      throw new ProviderUnavailable('ProviderExecutor instance is required.');
    }
    this.executor = executor;
  }

  async executePrompt(context: RuntimeContext): Promise<ProviderResult> {
    if (!context.promptResult) {
      throw new AIExecutionFailed('No prompt has been assembled in the RuntimeContext.');
    }

    const wu = context.currentWorkUnit;
    const providerId = (wu?.metadata as any)?.provider ?? 'mock';
    const model = (wu?.metadata as any)?.model ?? 'mock-model';

    const start = Date.now();
    try {
      const response = await this.executor.execute({
        providerId,
        model,
        prompt: context.promptResult.promptText,
      }, {
        timeoutMs: context.configuration.timeout,
      });

      const duration = Date.now() - start;

      if (!response.success) {
        if (response.error?.code === 'PROVIDER_TIMEOUT') {
          throw new ExecutionTimeout(`AI execution timed out after ${duration}ms.`, {
            cause: response.error,
          });
        }
        throw new AIExecutionFailed(`AI execution failed: ${response.error?.message}`, {
          cause: response.error,
        });
      }

      context.executionResult = response;

      const promptTokens = response.response?.usage?.promptTokens ?? response.metrics.estimatedPromptTokens ?? 0;
      const completionTokens = response.response?.usage?.completionTokens ?? 0;

      context.metrics.recordExecution(
        duration,
        providerId,
        promptTokens,
        completionTokens
      );

      return response;
    } catch (error: any) {
      if (error instanceof ExecutionTimeout || error instanceof AIExecutionFailed) {
        throw error;
      }
      if (error?.message?.includes('timeout') || error?.message?.includes('timed out')) {
        throw new ExecutionTimeout(`AI execution timed out.`, { cause: error });
      }
      throw new AIExecutionFailed(`AI execution failed: ${error.message}`, { cause: error });
    }
  }
}

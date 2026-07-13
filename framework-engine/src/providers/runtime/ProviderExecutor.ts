import { randomUUID } from 'node:crypto';
import type { HydratedContext } from '../../runtime/context/types.ts';
import { ProviderError, isProviderError } from './ProviderErrors.ts';
import type { ProviderExecutionContext, ProviderRequest } from './ProviderRequest.ts';
import type { ProviderRegistry } from './ProviderRegistry.ts';
import type { ProviderMetrics, ProviderResult } from './ProviderResponse.ts';
import type { PipelineResult } from './PipelineResult.ts';
import { loadConfiguration } from '../../config/ConfigurationLoader.ts';
import type { EngineConfiguration } from '../../config/EngineConfiguration.ts';

export class ProviderExecutor {
  private readonly registry: ProviderRegistry;
  private readonly defaultTimeoutMs: number;

  constructor(registry: ProviderRegistry, configuration: EngineConfiguration = loadConfiguration()) {
    this.registry = registry;
    this.defaultTimeoutMs = configuration.openai.timeout;
  }

  async execute(
    request: ProviderRequest,
    context: Partial<ProviderExecutionContext> = {},
  ): Promise<ProviderResult> {
    const startedAt = Date.now();
    const providerId = request.providerId ?? 'unknown';
    let providerName = providerId;
    try {
      if (!request.prompt || !request.prompt.trim()) {
        throw new ProviderError('INVALID_PAYLOAD', 'Provider prompt cannot be empty.');
      }

      const provider = this.registry.resolve(request.providerId);
      providerName = provider.id;
      const requestId = context.requestId ?? randomUUID();
      const timeoutMs = context.timeoutMs ?? this.defaultTimeoutMs;
      const controller = new AbortController();
      let timedOut = false;
      let cancelled = false;
      const callerSignal = context.signal;
      let rejectCancelled: ((reason?: unknown) => void) | undefined;
      const cancellationPromise = new Promise<never>((_, reject) => {
        rejectCancelled = reject;
      });
      const cancelCaller = () => {
        cancelled = true;
        controller.abort();
        rejectCancelled?.(new ProviderError('PROVIDER_CANCELLED', 'Provider execution was cancelled.'));
      };
      callerSignal?.addEventListener('abort', cancelCaller, { once: true });
      let rejectTimeout: ((reason?: unknown) => void) | undefined;
      const timeoutPromise = new Promise<never>((_, reject) => {
        rejectTimeout = reject;
      });
      const timeout = setTimeout(() => {
        timedOut = true;
        controller.abort();
        rejectTimeout?.(new ProviderError('PROVIDER_TIMEOUT', `Provider timed out after ${timeoutMs}ms.`, true));
      }, timeoutMs);
      if (callerSignal?.aborted) {
        cancelCaller();
      }

      try {
        const response = await Promise.race([
          provider.execute(request, {
            ...context,
            requestId,
            startedAt,
            timeoutMs,
            signal: controller.signal,
          }),
          timeoutPromise,
          cancellationPromise,
        ]);
        const metrics = this.metrics(providerName, request.prompt, response.content, startedAt);
        return { success: true, provider: providerName, response, metrics };
      } catch (error) {
        const normalized = timedOut
          ? new ProviderError('PROVIDER_TIMEOUT', `Provider timed out after ${timeoutMs}ms.`, true)
          : cancelled
            ? new ProviderError('PROVIDER_CANCELLED', 'Provider execution was cancelled.')
            : error;
        return {
          success: false,
          provider: providerName,
          metrics: this.metrics(providerName, request.prompt, '', startedAt),
          error: this.errorInfo(normalized),
        };
      } finally {
        clearTimeout(timeout);
        callerSignal?.removeEventListener('abort', cancelCaller);
      }
    } catch (error) {
      return {
        success: false,
        provider: providerName,
        metrics: this.metrics(providerName, request.prompt ?? '', '', startedAt),
        error: this.errorInfo(error),
      };
    }
  }

  executeContext(
    context: HydratedContext,
    request: Omit<ProviderRequest, 'prompt'> & { prompt?: string } = {},
    executionContext: Partial<ProviderExecutionContext> = {},
  ): Promise<ProviderResult> {
    return this.execute({
      ...request,
      prompt: request.prompt ?? context.sections.finalPayload,
      systemPrompt: request.systemPrompt ?? context.sections.systemPrompt,
      metadata: {
        ...request.metadata,
        capability: context.snapshot.capability,
        contextTokens: context.snapshot.budgetUsed,
      },
    }, executionContext);
  }

  async executePipeline(
    request: ProviderRequest,
    context: Partial<ProviderExecutionContext> = {},
  ): Promise<PipelineResult> {
    const startedAt = Date.now();
    const result = await this.execute(request, context);
    return {
      ...result,
      pipelineId: context.requestId ?? randomUUID(),
      request: { providerId: request.providerId, model: request.model },
      startedAt,
      completedAt: Date.now(),
    };
  }

  executeContextPipeline(
    context: HydratedContext,
    request: Omit<ProviderRequest, 'prompt'> & { prompt?: string } = {},
    executionContext: Partial<ProviderExecutionContext> = {},
  ): Promise<PipelineResult> {
    return this.executePipeline({
      ...request,
      prompt: request.prompt ?? context.sections.finalPayload,
      systemPrompt: request.systemPrompt ?? context.sections.systemPrompt,
      metadata: {
        ...request.metadata,
        capability: context.snapshot.capability,
        contextTokens: context.snapshot.budgetUsed,
      },
    }, executionContext);
  }

  private metrics(provider: string, prompt: string, response: string, startedAt: number): ProviderMetrics {
    return {
      durationMs: Date.now() - startedAt,
      estimatedPromptTokens: Math.max(0, Math.ceil(prompt.length / 4)),
      provider,
      promptSize: prompt.length,
      responseSize: response.length,
    };
  }

  private errorInfo(error: unknown): { code: string; message: string; retryable: boolean } {
    if (isProviderError(error)) {
      return { code: error.code, message: error.message, retryable: error.retryable };
    }
    return {
      code: 'PROVIDER_FAILURE',
      message: error instanceof Error ? error.message : String(error),
      retryable: false,
    };
  }
}

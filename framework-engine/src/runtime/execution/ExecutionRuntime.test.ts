import { test, describe } from 'node:test';
import assert from 'node:assert';
import { RuntimeExecutor } from '../RuntimeExecutor.ts';
import { ProviderExecutor } from '../../providers/runtime/ProviderExecutor.ts';
import { ProviderRegistry } from '../../providers/runtime/ProviderRegistry.ts';
import type { ProviderPort } from '../../providers/runtime/ProviderPort.ts';
import { ExecutionRuntimeBridge } from './ExecutionRuntimeBridge.ts';
import { AIExecutionFailed, ExecutionTimeout } from './ExecutionRuntimeErrors.ts';
import type { WorkUnit } from '../../workunit/WorkUnit.ts';
import { ProviderError } from '../../providers/runtime/ProviderErrors.ts';

const mockProviderPort: ProviderPort = {
  id: 'mock-llm',
  configuration: { id: 'mock-llm', type: 'mock' },
  capabilities: () => ({ streaming: false, supportsTemperature: true, supportsMaxTokens: true }),
  execute: async (req, context) => {
    if (req.prompt.includes('timeout-trigger')) {
      throw new ProviderError('PROVIDER_TIMEOUT', 'Provider request timed out', true);
    }
    if (req.prompt.includes('fail-trigger')) {
      throw new Error('LLM service unavailable');
    }
    return {
      content: 'mocked LLM generation content',
      provider: 'mock-llm',
      requestId: context.requestId,
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 }
    };
  }
};

const sampleWorkUnit: WorkUnit = {
  id: 'wu-3',
  title: 'Test AI Work Unit',
  description: 'Validating LLM generation workflow.',
  objective: 'generate unit tests for bridge',
  capability: 'codeGeneration',
  workflow: 'feature',
  priority: 'high',
  tags: ['testing', 'ai'],
  status: 'pending',
  author: 'Developer',
  createdAt: new Date().toISOString(),
  rawContent: '',
  metadata: {
    priority: 'high',
    provider: 'mock-llm',
    model: 'mock-model'
  } as any,
  body: '',
  instructions: 'Generate tests.',
  references: [],
  checklist: []
};

describe('ExecutionRuntimeIntegration', () => {
  test('ExecutionRuntimeBridge & RuntimeExecutor - executes prompt successfully', async () => {
    const registry = new ProviderRegistry();
    registry.register(mockProviderPort);
    const providerExecutor = new ProviderExecutor(registry, {
      openai: { timeout: 1000 }
    } as any);

    const executor = new RuntimeExecutor(undefined, undefined, providerExecutor);
    const context = executor.initialize('/workspace-root');
    context.currentWorkUnit = sampleWorkUnit;
    context.promptResult = {
      promptText: 'Hello AI world!',
      metadata: { providers: [], budget: { maxTokens: 1000, usableTokens: 800 }, timestamp: Date.now() },
      metrics: { executionTime: 10, compressionRatio: 1.0, sectionsProcessed: 1, tokensEstimados: 10, tokensEconomizados: 0 },
      snapshot: { promptFinal: 'Hello AI world!', usableBudget: 800, ratio: 1.0, executionTime: 10, secoes: [] }
    } as any;

    const bridge = new ExecutionRuntimeBridge(providerExecutor);
    await bridge.executePrompt(context);

    assert.ok(context.executionResult);
    assert.equal(context.executionResult.success, true);
    assert.equal(context.executionResult.provider, 'mock-llm');
    assert.equal(context.executionResult.response?.content, 'mocked LLM generation content');
    
    assert.equal(context.metrics.tokensPrompt, 10);
    assert.equal(context.metrics.tokensCompletion, 20);
    assert.ok(typeof context.metrics.executionDuration === 'number');

    const snap = executor.snapshot();
    assert.ok(snap.execution);
    assert.equal(snap.execution.success, true);
    assert.equal(snap.execution.content, 'mocked LLM generation content');
  });

  test('ExecutionRuntimeBridge - throws AIExecutionFailed on prompt missing', async () => {
    const registry = new ProviderRegistry();
    registry.register(mockProviderPort);
    const providerExecutor = new ProviderExecutor(registry, {
      openai: { timeout: 1000 }
    } as any);

    const bridge = new ExecutionRuntimeBridge(providerExecutor);
    const executor = new RuntimeExecutor();
    const context = executor.initialize('/workspace');

    await assert.rejects(async () => {
      await bridge.executePrompt(context);
    }, AIExecutionFailed);
  });

  test('ExecutionRuntimeBridge - throws ExecutionTimeout on timeout error', async () => {
    const registry = new ProviderRegistry();
    registry.register(mockProviderPort);
    const providerExecutor = new ProviderExecutor(registry, {
      openai: { timeout: 1000 }
    } as any);

    const executor = new RuntimeExecutor(undefined, undefined, providerExecutor);
    const context = executor.initialize('/workspace-root');
    context.currentWorkUnit = sampleWorkUnit;
    context.promptResult = {
      promptText: 'timeout-trigger',
      metadata: { providers: [], budget: { maxTokens: 1000, usableTokens: 800 }, timestamp: Date.now() },
      metrics: { executionTime: 10, compressionRatio: 1.0, sectionsProcessed: 1, tokensEstimados: 10, tokensEconomizados: 0 },
      snapshot: { promptFinal: 'timeout-trigger', usableBudget: 800, ratio: 1.0, executionTime: 10, secoes: [] }
    } as any;

    const bridge = new ExecutionRuntimeBridge(providerExecutor);
    await assert.rejects(async () => {
      await bridge.executePrompt(context);
    }, ExecutionTimeout);
  });

  test('ExecutionRuntimeBridge - throws AIExecutionFailed on service error', async () => {
    const registry = new ProviderRegistry();
    registry.register(mockProviderPort);
    const providerExecutor = new ProviderExecutor(registry, {
      openai: { timeout: 1000 }
    } as any);

    const executor = new RuntimeExecutor(undefined, undefined, providerExecutor);
    const context = executor.initialize('/workspace-root');
    context.currentWorkUnit = sampleWorkUnit;
    context.promptResult = {
      promptText: 'fail-trigger',
      metadata: { providers: [], budget: { maxTokens: 1000, usableTokens: 800 }, timestamp: Date.now() },
      metrics: { executionTime: 10, compressionRatio: 1.0, sectionsProcessed: 1, tokensEstimados: 10, tokensEconomizados: 0 },
      snapshot: { promptFinal: 'fail-trigger', usableBudget: 800, ratio: 1.0, executionTime: 10, secoes: [] }
    } as any;

    const bridge = new ExecutionRuntimeBridge(providerExecutor);
    await assert.rejects(async () => {
      await bridge.executePrompt(context);
    }, AIExecutionFailed);
  });
});

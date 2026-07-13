import assert from 'node:assert/strict';
import test from 'node:test';
import { ContextHydrator } from '../../runtime/context/ContextHydrator.ts';
import { ProviderError } from './ProviderErrors.ts';
import { ProviderExecutor } from './ProviderExecutor.ts';
import { ProviderFactory } from './ProviderFactory.ts';
import { MockProvider } from './MockProvider.ts';
import { ProviderRegistry } from './ProviderRegistry.ts';
import type { ProviderConfiguration } from './ProviderPort.ts';
import { mergeConfigurations } from '../../config/EngineConfiguration.ts';

function registry(provider = new MockProvider()): ProviderRegistry {
  return new ProviderRegistry().register(provider).setDefault(provider.id);
}

test('executes a prompt through MockProvider and returns metrics', async () => {
  const result = await new ProviderExecutor(registry()).execute({ prompt: 'Hello Framework' });
  assert.equal(result.success, true);
  assert.equal(result.provider, 'mock');
  assert.match(result.response?.content ?? '', /MockProvider/);
  assert.equal(result.metrics.provider, 'mock');
  assert.equal(result.metrics.promptSize, 15);
  assert.equal(result.metrics.responseSize > 0, true);
  assert.equal(result.metrics.estimatedPromptTokens, 4);
});

test('executes a hydrated context through the PromptAssembler payload', async () => {
  const context = {
    sections: {
      systemPrompt: 'System',
      capabilityPrompt: 'Capability',
      rules: '',
      knowledge: '',
      specification: '',
      workflows: '',
      templates: '',
      adrs: '',
      task: 'Task',
      finalPayload: '## SYSTEM PROMPT\nSystem\n\n## TASK\nTask',
    },
    documents: [],
    snapshot: {
      loadedFiles: [],
      discardedFiles: [],
      estimatedTokens: 10,
      budgetUsed: 10,
      capability: 'test',
      hydrationTimeMs: 1,
      warnings: [],
      statistics: {
        maxTokens: 100,
        usedTokens: 10,
        discardedTokens: 0,
        loadedDocuments: 0,
        discardedDocuments: 0,
        requiredDocuments: 0,
        optionalDocuments: 0,
      },
    },
  } as Awaited<ReturnType<ContextHydrator['hydrate']>>;
  const result = await new ProviderExecutor(registry()).executeContext(context);
  assert.equal(result.success, true);
  assert.equal(result.metrics.promptSize, context.sections.finalPayload.length);
});

test('returns a structured result for a missing provider', async () => {
  const result = await new ProviderExecutor(new ProviderRegistry()).execute({
    providerId: 'missing',
    prompt: 'Hello',
  });
  assert.equal(result.success, false);
  assert.equal(result.error?.code, 'PROVIDER_NOT_FOUND');
  assert.equal(result.metrics.provider, 'missing');
});

test('returns a structured result for an invalid payload', async () => {
  const result = await new ProviderExecutor(registry()).execute({ prompt: '   ' });
  assert.equal(result.success, false);
  assert.equal(result.error?.code, 'INVALID_PAYLOAD');
  assert.equal(result.metrics.promptSize, 3);
});

test('converts simulated provider failures into ProviderResult', async () => {
  const configuration: ProviderConfiguration = {
    id: 'failing-mock',
    type: 'mock',
    options: { failure: 'simulated failure' },
  };
  const result = await new ProviderExecutor(registry(new MockProvider(configuration))).execute({
    prompt: 'Hello',
  });
  assert.equal(result.success, false);
  assert.equal(result.error?.code, 'PROVIDER_FAILURE');
  assert.equal(result.error?.message, 'simulated failure');
});

test('returns timeout when MockProvider exceeds the executor limit', async () => {
  const provider = new MockProvider({ id: 'slow-mock', type: 'mock', options: { latencyMs: 50 } });
  const result = await new ProviderExecutor(registry(provider), mergeConfigurations({ openai: { timeout: 5 } })).execute({ prompt: 'Hello' });
  assert.equal(result.success, false);
  assert.equal(result.error?.code, 'PROVIDER_TIMEOUT');
  assert.equal(result.error?.retryable, true);
});

test('returns cancellation when the caller aborts execution', async () => {
  const controller = new AbortController();
  const provider = new MockProvider({ id: 'cancel-mock', type: 'mock', options: { latencyMs: 50 } });
  const promise = new ProviderExecutor(registry(provider)).execute(
    { prompt: 'Hello' },
    { signal: controller.signal },
  );
  controller.abort();
  const result = await promise;
  assert.equal(result.success, false);
  assert.equal(result.error?.code, 'PROVIDER_CANCELLED');
});

test('factory creates MockProvider and registry rejects duplicates', () => {
  const factory = new ProviderFactory();
  const provider = factory.create({ id: 'factory-mock', type: 'mock' });
  assert.equal(provider.id, 'factory-mock');
  const providers = new ProviderRegistry().register(provider);
  assert.throws(() => providers.register(provider), (error: unknown) => {
    return error instanceof ProviderError && error.code === 'PROVIDER_REGISTRY_DUPLICATE';
  });
});

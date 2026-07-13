import assert from 'node:assert/strict';
import test from 'node:test';
import { ProviderExecutor } from '../runtime/ProviderExecutor.ts';
import { ProviderRegistry } from '../runtime/ProviderRegistry.ts';
import { ProviderError } from '../runtime/ProviderErrors.ts';
import { GeminiConfiguration } from './GeminiConfiguration.ts';
import type { GeminiFetch } from './GeminiConfiguration.ts';
import { GeminiErrorMapper } from './GeminiErrorMapper.ts';
import { GeminiMapper } from './GeminiMapper.ts';
import { GeminiProvider } from './GeminiProvider.ts';
import { GeminiResponseParser } from './GeminiResponseParser.ts';
import { registerGeminiProvider } from './index.ts';

function responseBody(text = 'Hello from Gemini'): Record<string, unknown> {
  return {
    responseId: 'gemini-response-test',
    modelVersion: 'gemini-test',
    candidates: [{
      content: { parts: [{ text }] },
      finishReason: 'STOP',
    }],
    usageMetadata: { promptTokenCount: 4, candidatesTokenCount: 5, totalTokenCount: 9 },
  };
}

function fetchMock(body: Record<string, unknown> = responseBody()): { fetcher: GeminiFetch; calls: RequestInit[]; urls: string[] } {
  const calls: RequestInit[] = [];
  const urls: string[] = [];
  return {
    calls,
    urls,
    fetcher: async (input, init) => {
      urls.push(input);
      calls.push(init ?? {});
      return new Response(JSON.stringify(body), { status: 200 });
    },
  };
}

function executionContext(signal?: AbortSignal) {
  return { requestId: 'gemini-request-test', startedAt: Date.now(), signal };
}

test('loads Gemini configuration and supports environment values', () => {
  const originalKey = process.env.GEMINI_API_KEY;
  const originalModel = process.env.GEMINI_MODEL;
  process.env.GEMINI_API_KEY = 'env-gemini-key';
  process.env.GEMINI_MODEL = 'env-gemini-model';
  try {
    const configuration = new GeminiConfiguration({ temperature: 0.4, maxOutputTokens: 128 });
    assert.equal(configuration.apiKey, 'env-gemini-key');
    assert.equal(configuration.model, 'env-gemini-model');
    assert.equal(configuration.temperature, 0.4);
    assert.equal(configuration.maxOutputTokens, 128);
  } finally {
    if (originalKey === undefined) delete process.env.GEMINI_API_KEY;
    else process.env.GEMINI_API_KEY = originalKey;
    if (originalModel === undefined) delete process.env.GEMINI_MODEL;
    else process.env.GEMINI_MODEL = originalModel;
  }
});

test('maps ProviderRequest to Gemini generateContent payload and endpoint', () => {
  const configuration = new GeminiConfiguration({ apiKey: 'key', model: 'gemini-test', temperature: 0.2, maxOutputTokens: 64 });
  const mapper = new GeminiMapper();
  assert.deepEqual(mapper.toRequest({ prompt: 'Task', systemPrompt: 'System' }, configuration), {
    contents: [{ role: 'user', parts: [{ text: 'Task' }] }],
    systemInstruction: { parts: [{ text: 'System' }] },
    generationConfig: { temperature: 0.2, maxOutputTokens: 64 },
  });
  assert.equal(mapper.endpoint(configuration), 'https://generativelanguage.googleapis.com/v1beta/models/gemini-test:generateContent?key=key');
});

test('parses Gemini text, usage, model, finish reason and response id', () => {
  const result = new GeminiResponseParser().parse(responseBody(), 'request', 'gemini-test', 11);
  assert.equal(result.provider, 'gemini');
  assert.equal(result.content, 'Hello from Gemini');
  assert.equal(result.responseId, 'gemini-response-test');
  assert.equal(result.model, 'gemini-test');
  assert.equal(result.finishReason, 'STOP');
  assert.deepEqual(result.usage, { promptTokens: 4, completionTokens: 5, totalTokens: 9 });
  assert.equal(result.durationMs, 11);
});

test('maps Gemini HTTP errors and invalid responses', () => {
  const mapper = new GeminiErrorMapper();
  assert.equal(mapper.fromHttp(429, { error: { message: 'rate limited' } }).retryable, true);
  assert.equal(mapper.fromHttp(503, { error: { message: 'unavailable' } }).retryable, true);
  assert.equal(mapper.fromHttp(400, { error: { message: 'bad request' } }).retryable, false);
  assert.throws(() => new GeminiResponseParser().parse({ candidates: [] }, 'request', 'model'), (error: unknown) => {
    return error instanceof ProviderError && error.code === 'PROVIDER_FAILURE';
  });
});

test('executes Gemini through the unchanged ProviderExecutor', async () => {
  const mock = fetchMock();
  const provider = new GeminiProvider({ apiKey: 'key', model: 'gemini-test', fetcher: mock.fetcher });
  const registry = new ProviderRegistry().register(provider).setDefault('gemini');
  const result = await new ProviderExecutor(registry).execute({ prompt: 'Task', systemPrompt: 'System' }, executionContext());
  assert.equal(result.success, true);
  assert.equal(result.provider, 'gemini');
  assert.equal(result.response?.content, 'Hello from Gemini');
  assert.equal(mock.calls.length, 1);
  assert.equal(mock.calls[0].method, 'POST');
  assert.match(mock.urls[0], /generativelanguage\.googleapis\.com\/v1beta\/models\/gemini-test:generateContent/);
});

test('retries 429 and 5xx responses', async () => {
  for (const status of [429, 503]) {
    let calls = 0;
    const fetcher: GeminiFetch = async () => {
      calls += 1;
      return calls === 1
        ? new Response(JSON.stringify({ error: { message: 'retry' } }), { status })
        : new Response(JSON.stringify(responseBody('retried')), { status: 200 });
    };
    const provider = new GeminiProvider({ apiKey: 'key', maxRetries: 1, retryDelayMs: 0, fetcher });
    const result = await provider.execute({ prompt: 'Task' }, executionContext());
    assert.equal(result.content, 'retried');
    assert.equal(calls, 2);
  }
});

test('supports timeout and cancellation', async () => {
  const slowFetcher: GeminiFetch = (_input, init) => new Promise((_, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true });
  });
  const timeoutProvider = new GeminiProvider({ apiKey: 'key', timeoutMs: 5, fetcher: slowFetcher });
  await assert.rejects(() => timeoutProvider.execute({ prompt: 'Task' }, executionContext()), (error: unknown) => {
    return error instanceof ProviderError && error.code === 'PROVIDER_TIMEOUT';
  });

  const controller = new AbortController();
  controller.abort();
  const cancelledProvider = new GeminiProvider({ apiKey: 'key', fetcher: fetchMock().fetcher });
  await assert.rejects(() => cancelledProvider.execute({ prompt: 'Task' }, executionContext(controller.signal)), (error: unknown) => {
    return error instanceof ProviderError && error.code === 'PROVIDER_CANCELLED';
  });
});

test('registerGeminiProvider registers the adapter in ProviderRegistry', () => {
  const registry = new ProviderRegistry();
  const provider = registerGeminiProvider(registry, { apiKey: 'key', fetcher: fetchMock().fetcher });
  assert.equal(provider.id, 'gemini');
  assert.equal(registry.has('gemini'), true);
});

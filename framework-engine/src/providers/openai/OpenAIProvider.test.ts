import assert from 'node:assert/strict';
import test from 'node:test';
import { ProviderExecutor } from '../runtime/ProviderExecutor.ts';
import { ProviderRegistry } from '../runtime/ProviderRegistry.ts';
import { ProviderError } from '../runtime/ProviderErrors.ts';
import { OpenAIConfiguration } from './OpenAIConfiguration.ts';
import { OpenAIErrorMapper } from './OpenAIErrorMapper.ts';
import { OpenAIMapper } from './OpenAIMapper.ts';
import { OpenAIProvider } from './OpenAIProvider.ts';
import { OpenAIResponseParser } from './OpenAIResponseParser.ts';
import { registerOpenAIProvider } from './index.ts';
import type { OpenAIFetch } from './OpenAIConfiguration.ts';

function responseBody(content = 'Hello from OpenAI'): Record<string, unknown> {
  return {
    id: 'resp_test',
    model: 'gpt-test',
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: content }] }],
    usage: { input_tokens: 4, output_tokens: 5, total_tokens: 9 },
  };
}

function fetchMock(body: Record<string, unknown> = responseBody()): { fetcher: OpenAIFetch; calls: RequestInit[] } {
  const calls: RequestInit[] = [];
  return {
    calls,
    fetcher: async (_input, init) => {
      calls.push(init ?? {});
      return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
    },
  };
}

function executionContext(signal?: AbortSignal) {
  return { requestId: 'request_test', startedAt: Date.now(), signal };
}

test('loads OpenAI configuration with explicit options and defaults', () => {
  const configuration = new OpenAIConfiguration({
    apiKey: 'test-key',
    baseUrl: 'https://example.test/v1/',
    model: 'gpt-test',
    timeoutMs: 100,
    maxRetries: 1,
    temperature: 0.4,
    maxOutputTokens: 128,
  });
  assert.equal(configuration.apiKey, 'test-key');
  assert.equal(configuration.baseUrl, 'https://example.test/v1');
  assert.equal(configuration.model, 'gpt-test');
  assert.equal(configuration.timeoutMs, 100);
  assert.equal(configuration.maxRetries, 1);
  assert.equal(configuration.temperature, 0.4);
  assert.equal(configuration.maxOutputTokens, 128);
});

test('maps ProviderRequest and HydratedContext to Responses API payload', () => {
  const configuration = new OpenAIConfiguration({ apiKey: 'test-key', model: 'gpt-test', temperature: 0.2, maxOutputTokens: 64 });
  const mapper = new OpenAIMapper();
  const request = mapper.toRequest({ prompt: 'Task', systemPrompt: 'System' }, configuration);
  assert.deepEqual(request, {
    model: 'gpt-test',
    input: 'Task',
    instructions: 'System',
    temperature: 0.2,
    max_output_tokens: 64,
  });
});

test('parses Responses API text, usage, finish reason and metadata', () => {
  const parsed = new OpenAIResponseParser().parse(responseBody(), 'request_test', 12);
  assert.equal(parsed.content, 'Hello from OpenAI');
  assert.equal(parsed.responseId, 'resp_test');
  assert.equal(parsed.model, 'gpt-test');
  assert.equal(parsed.finishReason, 'stop');
  assert.deepEqual(parsed.usage, { promptTokens: 4, completionTokens: 5, totalTokens: 9 });
  assert.equal(parsed.durationMs, 12);
});

test('maps OpenAI HTTP errors to structured ProviderErrors', () => {
  const mapper = new OpenAIErrorMapper();
  assert.equal(mapper.fromHttp(429, { error: { message: 'slow down' } }).code, 'OPENAI_RATE_LIMIT');
  assert.equal(mapper.fromHttp(503, { error: { message: 'offline' } }).code, 'OPENAI_UNAVAILABLE');
  assert.equal(mapper.fromHttp(400, { error: { message: 'bad request' } }).code, 'OPENAI_HTTP_ERROR');
});

test('executes through Responses API mapping and ProviderExecutor', async () => {
  const mock = fetchMock();
  const provider = new OpenAIProvider({ apiKey: 'test-key', model: 'gpt-test', fetcher: mock.fetcher });
  const registry = new ProviderRegistry().register(provider).setDefault('openai');
  const result = await new ProviderExecutor(registry).executePipeline(
    { prompt: 'Task', systemPrompt: 'System' },
    executionContext(),
  );
  assert.equal(result.success, true);
  assert.equal(result.pipelineId, 'request_test');
  assert.equal(result.response?.content, 'Hello from OpenAI');
  assert.equal(mock.calls.length, 1);
  assert.equal(mock.calls[0].method, 'POST');
  assert.match(String(mock.calls[0].body), /"model":"gpt-test"/);
  assert.match(String(mock.calls[0].body), /"input":"Task"/);
});

test('returns a structured result when API key is missing', async () => {
  const provider = new OpenAIProvider({ apiKey: '', fetcher: fetchMock().fetcher });
  const result = await new ProviderExecutor(new ProviderRegistry().register(provider).setDefault('openai')).execute({ prompt: 'Task' });
  assert.equal(result.success, false);
  assert.equal(result.error?.code, 'OPENAI_API_KEY_MISSING');
});

test('retries rate limits and succeeds without calling a real API', async () => {
  let calls = 0;
  const fetcher: OpenAIFetch = async () => {
    calls += 1;
    if (calls === 1) {
      return new Response(JSON.stringify({ error: { message: 'rate limit' } }), { status: 429 });
    }
    return new Response(JSON.stringify(responseBody('retried')), { status: 200 });
  };
  const provider = new OpenAIProvider({ apiKey: 'test-key', maxRetries: 1, retryDelayMs: 0, fetcher });
  const result = await provider.execute({ prompt: 'Task' }, executionContext());
  assert.equal(result.content, 'retried');
  assert.equal(calls, 2);
});

test('retries a 5xx response before succeeding', async () => {
  let calls = 0;
  const fetcher: OpenAIFetch = async () => {
    calls += 1;
    if (calls === 1) {
      return new Response(JSON.stringify({ error: { message: 'temporary outage' } }), { status: 503 });
    }
    return new Response(JSON.stringify(responseBody('recovered')), { status: 200 });
  };
  const provider = new OpenAIProvider({ apiKey: 'test-key', maxRetries: 1, retryDelayMs: 0, fetcher });
  const result = await provider.execute({ prompt: 'Task' }, executionContext());
  assert.equal(result.content, 'recovered');
  assert.equal(calls, 2);
});

test('handles timeout, cancellation, invalid response and registry registration', async () => {
  const timeoutFetcher: OpenAIFetch = (_input, init) => new Promise((_, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true });
  });
  const timeoutProvider = new OpenAIProvider({ apiKey: 'test-key', timeoutMs: 5, fetcher: timeoutFetcher });
  await assert.rejects(
    () => timeoutProvider.execute({ prompt: 'Task' }, executionContext()),
    (error: unknown) => error instanceof ProviderError && error.code === 'PROVIDER_TIMEOUT',
  );

  const controller = new AbortController();
  controller.abort();
  const cancelledProvider = new OpenAIProvider({ apiKey: 'test-key', fetcher: fetchMock().fetcher });
  await assert.rejects(
    () => cancelledProvider.execute({ prompt: 'Task' }, executionContext(controller.signal)),
    (error: unknown) => error instanceof ProviderError && error.code === 'OPENAI_CANCELLED',
  );

  await assert.rejects(
    () => Promise.resolve().then(() => new OpenAIResponseParser().parse({ id: 'bad' }, 'request_test')),
    (error: unknown) => error instanceof ProviderError && error.code === 'OPENAI_INVALID_RESPONSE',
  );

  const registry = new ProviderRegistry();
  registerOpenAIProvider(registry, { apiKey: 'test-key', fetcher: fetchMock().fetcher });
  assert.equal(registry.has('openai'), true);
});

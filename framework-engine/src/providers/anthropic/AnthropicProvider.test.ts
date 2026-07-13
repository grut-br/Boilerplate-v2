import assert from 'node:assert/strict';
import test from 'node:test';
import { ProviderExecutor } from '../runtime/ProviderExecutor.ts';
import { ProviderRegistry } from '../runtime/ProviderRegistry.ts';
import { ProviderError } from '../runtime/ProviderErrors.ts';
import { AnthropicConfiguration } from './AnthropicConfiguration.ts';
import { AnthropicErrorMapper } from './AnthropicErrorMapper.ts';
import { AnthropicMapper } from './AnthropicMapper.ts';
import { AnthropicProvider } from './AnthropicProvider.ts';
import { AnthropicResponseParser } from './AnthropicResponseParser.ts';
import { registerAnthropicProvider } from './index.ts';
import type { AnthropicFetch } from './AnthropicConfiguration.ts';

function responseBody(content = 'Hello from Claude'): Record<string, unknown> {
  return {
    id: 'msg_test',
    type: 'message',
    role: 'assistant',
    model: 'claude-test',
    content: [{ type: 'text', text: content }],
    stop_reason: 'end_turn',
    usage: { input_tokens: 4, output_tokens: 5 },
  };
}

function fetchMock(body: Record<string, unknown> = responseBody()): { fetcher: AnthropicFetch; calls: RequestInit[] } {
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

test('loads Anthropic configuration and environment values', () => {
  const names = ['ANTHROPIC_API_KEY', 'ANTHROPIC_MODEL', 'ANTHROPIC_BASE_URL', 'ANTHROPIC_TIMEOUT', 'ANTHROPIC_MAX_OUTPUT_TOKENS', 'ANTHROPIC_TEMPERATURE'];
  const previous = new Map(names.map((name) => [name, process.env[name]]));
  process.env.ANTHROPIC_API_KEY = 'env-key';
  process.env.ANTHROPIC_MODEL = 'env-model';
  process.env.ANTHROPIC_BASE_URL = 'https://example.test/v1/';
  process.env.ANTHROPIC_TIMEOUT = '1200';
  process.env.ANTHROPIC_MAX_OUTPUT_TOKENS = '512';
  process.env.ANTHROPIC_TEMPERATURE = '0.3';
  try {
    const configuration = new AnthropicConfiguration();
    assert.equal(configuration.apiKey, 'env-key');
    assert.equal(configuration.model, 'env-model');
    assert.equal(configuration.baseUrl, 'https://example.test/v1');
    assert.equal(configuration.timeoutMs, 1200);
    assert.equal(configuration.maxOutputTokens, 512);
    assert.equal(configuration.temperature, 0.3);
  } finally {
    for (const [name, value] of previous) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test('maps ProviderRequest to the Messages API payload', () => {
  const configuration = new AnthropicConfiguration({ apiKey: 'key', model: 'claude-test', temperature: 0.2, maxOutputTokens: 64 });
  const request = new AnthropicMapper().toRequest({ prompt: 'Task', systemPrompt: 'System' }, configuration);
  assert.deepEqual(request, {
    model: 'claude-test',
    max_tokens: 64,
    messages: [{ role: 'user', content: 'Task' }],
    system: 'System',
    temperature: 0.2,
  });
});

test('parses Messages API text, usage, finish reason and metadata', () => {
  const parsed = new AnthropicResponseParser().parse(responseBody(), 'request_test', 12);
  assert.equal(parsed.content, 'Hello from Claude');
  assert.equal(parsed.responseId, 'msg_test');
  assert.equal(parsed.model, 'claude-test');
  assert.equal(parsed.finishReason, 'end_turn');
  assert.deepEqual(parsed.usage, { promptTokens: 4, completionTokens: 5, totalTokens: 9 });
  assert.equal(parsed.durationMs, 12);
});

test('maps Anthropic HTTP errors and invalid responses', () => {
  const mapper = new AnthropicErrorMapper();
  assert.equal(mapper.fromHttp(429, { error: { message: 'slow down' } }).retryable, true);
  assert.equal(mapper.fromHttp(503, { error: { message: 'offline' } }).retryable, true);
  assert.equal(mapper.fromHttp(400, { error: { message: 'bad request' } }).retryable, false);
  assert.throws(() => new AnthropicResponseParser().parse({ id: 'bad' }, 'request_test'), (error: unknown) => error instanceof ProviderError);
});

test('executes through Messages API mapping and ProviderExecutor', async () => {
  const mock = fetchMock();
  const provider = new AnthropicProvider({ apiKey: 'key', model: 'claude-test', fetcher: mock.fetcher });
  const registry = new ProviderRegistry().register(provider).setDefault('anthropic');
  const result = await new ProviderExecutor(registry).executePipeline(
    { prompt: 'Task', systemPrompt: 'System' },
    executionContext(),
  );
  assert.equal(result.success, true);
  assert.equal(result.pipelineId, 'request_test');
  assert.equal(result.response?.content, 'Hello from Claude');
  assert.equal(mock.calls.length, 1);
  assert.equal(mock.calls[0].method, 'POST');
  assert.match(String(mock.calls[0].body), /"max_tokens":4096/);
  assert.match(String(mock.calls[0].body), /"messages":\[\{"role":"user","content":"Task"\}\]/);
});

test('returns a structured result when the API key is missing', async () => {
  const provider = new AnthropicProvider({ apiKey: '', fetcher: fetchMock().fetcher });
  const result = await new ProviderExecutor(new ProviderRegistry().register(provider).setDefault('anthropic')).execute({ prompt: 'Task' });
  assert.equal(result.success, false);
  assert.equal(result.error?.code, 'INVALID_PROVIDER_CONFIGURATION');
});

test('retries 429 and 5xx responses before succeeding', async () => {
  for (const status of [429, 503]) {
    let calls = 0;
    const fetcher: AnthropicFetch = async () => {
      calls += 1;
      if (calls === 1) return new Response(JSON.stringify({ error: { message: 'temporary' } }), { status });
      return new Response(JSON.stringify(responseBody('retried')), { status: 200 });
    };
    const result = await new AnthropicProvider({ apiKey: 'key', maxRetries: 1, retryDelayMs: 0, fetcher })
      .execute({ prompt: 'Task' }, executionContext());
    assert.equal(result.content, 'retried');
    assert.equal(calls, 2);
  }
});

test('handles timeout, cancellation and provider registry registration', async () => {
  const timeoutFetcher: AnthropicFetch = (_input, init) => new Promise((_, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true });
  });
  await assert.rejects(
    () => new AnthropicProvider({ apiKey: 'key', timeoutMs: 5, fetcher: timeoutFetcher }).execute({ prompt: 'Task' }, executionContext()),
    (error: unknown) => error instanceof ProviderError && error.code === 'PROVIDER_TIMEOUT',
  );

  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    () => new AnthropicProvider({ apiKey: 'key', fetcher: fetchMock().fetcher }).execute({ prompt: 'Task' }, executionContext(controller.signal)),
    (error: unknown) => error instanceof ProviderError && error.code === 'PROVIDER_CANCELLED',
  );

  const registry = new ProviderRegistry();
  const provider = registerAnthropicProvider(registry, { apiKey: 'key', fetcher: fetchMock().fetcher });
  assert.equal(provider.id, 'anthropic');
  assert.equal(registry.has('anthropic'), true);
});

import {
  DiagnosticsCollector,
  EngineLogger,
  MockProvider,
  OpenAIProvider,
  ProviderExecutor,
  ProviderRegistry,
  type OpenAIFetch,
} from '../src/index.ts';

interface BenchmarkSample {
  durationMs: number;
  success: boolean;
}

interface BenchmarkStats {
  provider: string;
  executions: number;
  successes: number;
  averageMs: number;
  minimumMs: number;
  maximumMs: number;
  standardDeviationMs: number;
}

function statistics(provider: string, samples: BenchmarkSample[]): BenchmarkStats {
  const durations = samples.map((sample) => sample.durationMs);
  const averageMs = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
  const variance = durations.reduce((sum, duration) => sum + ((duration - averageMs) ** 2), 0) / durations.length;
  return {
    provider,
    executions: samples.length,
    successes: samples.filter((sample) => sample.success).length,
    averageMs: Number(averageMs.toFixed(3)),
    minimumMs: Number(Math.min(...durations).toFixed(3)),
    maximumMs: Number(Math.max(...durations).toFixed(3)),
    standardDeviationMs: Number(Math.sqrt(variance).toFixed(3)),
  };
}

async function benchmarkProvider(executor: ProviderExecutor, provider: string): Promise<BenchmarkStats> {
  const samples: BenchmarkSample[] = [];
  for (let index = 0; index < 10; index += 1) {
    const diagnostics = new DiagnosticsCollector(new EngineLogger({ level: 'SILENT' }));
    diagnostics.start({ executionId: `${provider}-benchmark-${index}` });
    diagnostics.startStage('Pipeline');
    diagnostics.endStage('Pipeline');
    diagnostics.startStage('Hydration');
    diagnostics.endStage('Hydration', { documents: 0, cache: 'miss' });
    diagnostics.startStage('Provider');
    const result = await executor.execute({ providerId: provider, prompt: 'Benchmark prompt.' }, { requestId: `${provider}-${index}` });
    diagnostics.endStage('Provider');
    diagnostics.startStage('Response');
    diagnostics.endStage('Response');
    diagnostics.startStage('Result');
    diagnostics.endStage('Result');
    diagnostics.startStage('Finished');
    diagnostics.endStage('Finished');
    diagnostics.recordProviderResult(result, 'Benchmark prompt.');
    const snapshot = diagnostics.finish();
    samples.push({ durationMs: snapshot.metrics.durationMs, success: result.success });
  }
  return statistics(provider, samples);
}

function openAIBenchmarkFetcher(): OpenAIFetch {
  return async () => new Response(JSON.stringify({
    id: 'benchmark-response',
    model: 'benchmark-model',
    status: 'completed',
    output: [{ type: 'message', content: [{ type: 'output_text', text: 'Benchmark response.' }] }],
    usage: { input_tokens: 3, output_tokens: 3, total_tokens: 6 },
  }), { status: 200, headers: { 'content-type': 'application/json' } });
}

async function main(): Promise<void> {
  const mockRegistry = new ProviderRegistry().register(new MockProvider({
    id: 'mock',
    type: 'mock',
    options: { response: 'Benchmark response.' },
  })).setDefault('mock');
  const openAIRegistry = new ProviderRegistry().register(new OpenAIProvider({
    apiKey: 'benchmark-key',
    model: 'benchmark-model',
    fetcher: openAIBenchmarkFetcher(),
  })).setDefault('openai');
  const mockStats = await benchmarkProvider(new ProviderExecutor(mockRegistry), 'mock');
  const openAIStats = await benchmarkProvider(new ProviderExecutor(openAIRegistry), 'openai');
  console.log(JSON.stringify({ benchmark: [mockStats, openAIStats] }, null, 2));
}

void main();

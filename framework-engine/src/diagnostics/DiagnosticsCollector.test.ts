import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DiagnosticsCollector,
  EngineLogger,
  ExecutionMetrics,
  ExecutionTrace,
  LogLevel,
  PerformanceTimer,
  DiagnosticsReport,
} from './index.ts';

test('filters logger entries by level and preserves structured context', () => {
  const entries: Array<{ level: string; message: string; context?: Record<string, unknown>; data?: Record<string, unknown> }> = [];
  const logger = new EngineLogger({
    level: LogLevel.INFO,
    context: { component: 'test' },
    sink: (entry) => entries.push(entry),
  });
  logger.debug('hidden');
  logger.info('visible', { requestId: 'request-1' });
  logger.error('failure');
  assert.deepEqual(entries.map((entry) => entry.message), ['visible', 'failure']);
  assert.equal(entries[0].context?.component, 'test');
  assert.equal(entries[0].data?.requestId, 'request-1');
});

test('supports all levels and silent logging', () => {
  const entries: unknown[] = [];
  const logger = new EngineLogger({ level: 'TRACE', sink: (entry) => entries.push(entry) });
  logger.trace('trace');
  logger.debug('debug');
  logger.info('info');
  logger.warn('warn');
  logger.error('error');
  assert.equal(entries.length, 5);
  const silent = new EngineLogger({ level: 'SILENT', sink: (entry) => entries.push(entry) });
  silent.error('hidden');
  assert.equal(entries.length, 5);
});

test('records the complete execution trace in stage order', () => {
  const trace = new ExecutionTrace('execution-test', 100);
  trace.start('Pipeline', 100);
  trace.end('Pipeline', 102);
  trace.start('Hydration', 102);
  trace.end('Hydration', 105, { documents: 3 });
  for (const stage of ['Provider', 'Response', 'Result', 'Finished'] as const) {
    trace.start(stage, 105);
    trace.end(stage, 106);
  }
  const snapshot = trace.finish(110);
  assert.deepEqual(snapshot.spans.map((span) => span.stage), [
    'Pipeline', 'Hydration', 'Provider', 'Response', 'Result', 'Finished',
  ]);
  assert.equal(snapshot.durationMs, 10);
  assert.equal(snapshot.spans[1].metadata?.documents, 3);
});

test('collects provider metrics and stage durations', () => {
  const collector = new DiagnosticsCollector(new EngineLogger({ level: 'SILENT' }));
  collector.start({ executionId: 'execution-test', startedAt: 100 });
  collector.startStage('Pipeline');
  collector.endStage('Pipeline');
  collector.startStage('Provider');
  collector.endStage('Provider');
  collector.recordMetrics({ provider: 'mock', model: 'mock-model', retries: 2, hydratedDocuments: 4, cache: 'hit' });
  const snapshot = collector.finish(110);
  assert.equal(snapshot.trace.executionId, 'execution-test');
  assert.equal(snapshot.metrics.provider, 'mock');
  assert.equal(snapshot.metrics.retries, 2);
  assert.equal(snapshot.metrics.hydratedDocuments, 4);
  assert.equal(snapshot.metrics.cache, 'hit');
  assert.equal(snapshot.metrics.totalDurationMs, 10);
  assert.equal(snapshot.metrics.stageDurations.Pipeline !== undefined, true);
});

test('maps ProviderResult usage into execution metrics', () => {
  const metrics = ExecutionMetrics.fromProviderResult({
    success: true,
    provider: 'mock',
    metrics: { durationMs: 8, estimatedPromptTokens: 3, provider: 'mock', promptSize: 12, responseSize: 20 },
    response: {
      content: 'response',
      provider: 'mock',
      requestId: 'request-1',
      model: 'mock-model',
      usage: { promptTokens: 4, completionTokens: 5, totalTokens: 9 },
    },
  }, 'prompt');
  assert.equal(metrics.estimatedPromptTokens, 3);
  assert.equal(metrics.promptTokens, 4);
  assert.equal(metrics.returnedTokens, 9);
  assert.equal(metrics.model, 'mock-model');
});

test('performance timer is monotonic and idempotent after stop', () => {
  const timer = PerformanceTimer.start();
  const first = timer.stop();
  assert.equal(timer.stop(), first);
  assert.equal(first >= 0, true);
});

test('diagnostics report generates JSON, markdown, and console strings', () => {
  const collector = new DiagnosticsCollector(new EngineLogger({ level: 'SILENT' }));
  collector.start({ executionId: 'report-test', startedAt: 1000 });
  
  collector.startStage('Bootstrap');
  collector.endStage('Bootstrap');
  
  collector.startStage('Context Resolution');
  collector.endStage('Context Resolution');
  
  collector.recordMetrics({
    provider: 'mock-provider',
    model: 'mock-model',
    estimatedPromptTokens: 10,
    estimatedCompletionTokens: 20,
    promptTokens: 11,
    completionTokens: 22,
    returnedTokens: 33,
    promptSize: 100,
    responseSize: 200,
    hydratedDocuments: 5,
    cache: 'hit',
    retries: 1,
    timeout: false
  });
  
  const snapshot = collector.finish(2000);
  const report = new DiagnosticsReport(snapshot);
  
  const json = report.toJSON();
  assert.equal(json.includes('"executionId": "report-test"'), true);
  assert.equal(json.includes('"provider": "mock-provider"'), true);
  
  const md = report.toMarkdown();
  assert.equal(md.includes('# Execution Diagnostics Report - report-test'), true);
  assert.equal(md.includes('- **Provider**: mock-provider'), true);
  assert.equal(md.includes('- **Model**: mock-model'), true);
  assert.equal(md.includes('| Bootstrap |'), true);
  
  const consoleStr = report.toConsoleString();
  assert.equal(consoleStr.includes('[DIAGNOSTICS] Execution: report-test'), true);
  assert.equal(consoleStr.includes('mock-provider (mock-model)'), true);
});

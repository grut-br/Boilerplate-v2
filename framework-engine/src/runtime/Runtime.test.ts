import assert from 'node:assert/strict';
import test from 'node:test';
import {
  InvalidRuntimeState,
  Runtime,
  RuntimeAlreadyInitialized,
  RuntimeConfiguration,
  RuntimeExecutionFailed,
  RuntimeExecutor,
  RuntimeMetrics,
  RuntimeNotInitialized,
  RuntimePipeline,
  RuntimePipelineError,
  RuntimeStageName,
  RuntimeState,
} from './index.ts';

test('initializes with configuration and an initialized context', () => {
  const runtime = new Runtime();
  const context = runtime.initialize('/workspace', {
    timeout: 5_000,
    verbose: true,
    debug: true,
    dryRun: true,
    metricsEnabled: false,
  });

  assert.equal(runtime.state, RuntimeState.Initialized);
  assert.equal(context.workspace, '/workspace');
  assert.deepEqual(context.configuration.toJSON(), {
    timeout: 5_000,
    verbose: true,
    debug: true,
    dryRun: true,
    metricsEnabled: false,
  });
});

test('follows the deterministic lifecycle and can be disposed', () => {
  const executor = new RuntimeExecutor();
  assert.equal(executor.state, RuntimeState.Uninitialized);

  executor.initialize('/workspace');
  assert.equal(executor.state, RuntimeState.Initialized);

  const snapshot = executor.execute();
  assert.equal(snapshot.runtimeState, RuntimeState.Completed);
  assert.equal(executor.state, RuntimeState.Completed);

  executor.dispose();
  assert.equal(executor.state, RuntimeState.Uninitialized);
});

test('rejects invalid lifecycle transitions', () => {
  const runtime = new Runtime();

  assert.throws(() => runtime.execute(), RuntimeNotInitialized);
  runtime.initialize('/workspace');
  assert.throws(() => runtime.initialize('/workspace'), RuntimeAlreadyInitialized);
  runtime.execute();
  assert.throws(() => runtime.execute(), InvalidRuntimeState);
});

test('records runtime metrics', () => {
  const metrics = new RuntimeMetrics();
  metrics.start(100);
  metrics.setStage(RuntimeStageName.Execution);
  metrics.finish(125);

  assert.deepEqual(metrics.toJSON(), {
    startTime: 100,
    finishTime: 125,
    duration: 25,
    currentStage: RuntimeStageName.Execution,
    executionStatus: 'completed',
  });
});

test('serializes a snapshot without Work Units', () => {
  const runtime = new Runtime();
  runtime.initialize('/workspace', new RuntimeConfiguration({ dryRun: true }));
  const snapshot = runtime.execute();

  assert.equal(typeof snapshot.executionId, 'string');
  assert.equal(snapshot.runtimeState, RuntimeState.Completed);
  assert.equal(snapshot.configuration.dryRun, true);
  assert.equal(snapshot.pipeline.length, 7);
  assert.equal('workUnits' in snapshot, false);
});

test('represents the frozen pipeline stages in order', () => {
  const pipeline = new RuntimePipeline();

  assert.deepEqual(pipeline.toJSON(), [
    RuntimeStageName.LoadWorkUnit,
    RuntimeStageName.ResolveCapability,
    RuntimeStageName.ResolveWorkflow,
    RuntimeStageName.KnowledgeResolution,
    RuntimeStageName.PromptAssembly,
    RuntimeStageName.Execution,
    RuntimeStageName.Finalize,
  ]);
});

test('exposes the required runtime error types', () => {
  const executionError = new RuntimeExecutionFailed('execution failed');
  const pipelineError = new RuntimePipelineError('pipeline failed');

  assert.equal(executionError.name, 'RuntimeExecutionFailed');
  assert.equal(pipelineError.name, 'RuntimePipelineError');
  assert.throws(() => new RuntimeConfiguration({ timeout: -1 }), TypeError);
});

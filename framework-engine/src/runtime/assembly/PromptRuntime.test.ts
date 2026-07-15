import { test, describe } from 'node:test';
import assert from 'node:assert';
import { RuntimeExecutor } from '../RuntimeExecutor.ts';
import { PromptAssembler } from '../../prompt/PromptAssembler.ts';
import { PromptRuntimeMapper } from './PromptRuntimeMapper.ts';
import { PromptRuntimeBridge } from './PromptRuntimeBridge.ts';
import { InvalidPromptAssemblyRequest, PromptAssemblyFailed, PromptAssemblyTimeout } from './PromptRuntimeErrors.ts';
import type { WorkUnit } from '../../workunit/WorkUnit.ts';

const sampleWorkUnit: WorkUnit = {
  id: 'wu-2',
  title: 'Test Prompt Work Unit',
  description: 'Validating prompt construction workflow.',
  objective: 'query-text: build a database schema',
  capability: 'codeGeneration',
  workflow: 'feature',
  priority: 'medium',
  tags: ['orm', 'migration'],
  status: 'pending',
  author: 'Developer',
  createdAt: new Date().toISOString(),
  rawContent: '',
  metadata: { priority: 'medium' } as any,
  body: '',
  instructions: 'Generate migration script for next-auth schema.',
  references: [],
  checklist: ['Verify table relations', 'Add indexes']
};

describe('PromptRuntimeIntegration', () => {
  test('PromptRuntimeMapper - maps RuntimeContext to PromptAssemblyRequest correctly', () => {
    const executor = new RuntimeExecutor();
    const context = executor.initialize('/workspace-root');
    context.currentWorkUnit = sampleWorkUnit;
    context.knowledgeResult = {
      documents: [{ id: 'doc-1', content: 'interface User {}', path: 'src/user.ts', metadata: {} }],
      nodes: [{ id: 'node-1', properties: {}, type: 'interface', metadata: {} }],
      metadata: { success: true },
      diagnostics: {},
      duration: 10
    };

    const request = PromptRuntimeMapper.toAssemblyRequest(context);
    assert.equal(request.layoutPreset, 'codeGeneration');
    
    const sysSection = request.sections.find(s => s.name === 'System');
    assert.ok(sysSection);
    assert.ok(sysSection.content.includes('workspace-root'));

    const taskSection = request.sections.find(s => s.name === 'Task');
    assert.ok(taskSection);
    assert.ok(taskSection.content.includes('Generate migration script'));

    const knowledgeSection = request.sections.find(s => s.name === 'Knowledge');
    assert.ok(knowledgeSection);
    assert.ok(knowledgeSection.content.includes('interface User {}'));
  });

  test('PromptRuntimeMapper - throws on null context or missing WorkUnit', () => {
    assert.throws(() => {
      PromptRuntimeMapper.toAssemblyRequest(null as any);
    }, InvalidPromptAssemblyRequest);

    const executor = new RuntimeExecutor();
    const context = executor.initialize('/workspace-root');
    assert.throws(() => {
      PromptRuntimeMapper.toAssemblyRequest(context);
    }, InvalidPromptAssemblyRequest);
  });

  test('PromptRuntimeBridge & RuntimeExecutor - completes prompt lifecycle successfully', () => {
    const assembler = new PromptAssembler();
    const executor = new RuntimeExecutor(undefined, assembler);
    
    const context = executor.initialize('/workspace-root');
    context.currentWorkUnit = sampleWorkUnit;
    context.knowledgeResult = {
      documents: [{ id: 'doc-1', content: 'interface User {}', path: 'src/user.ts', metadata: {} }],
      nodes: [{ id: 'node-1', properties: {}, type: 'interface', metadata: {} }],
      metadata: { success: true },
      diagnostics: {},
      duration: 10
    };

    const bridge = new PromptRuntimeBridge(assembler);
    bridge.assemblePrompt(context);

    assert.ok(context.promptRequest);
    assert.ok(context.promptResult);
    assert.ok(context.promptResult.promptText.includes('migration script'));
    assert.equal(context.metrics.capabilitiesInjected, 1);
    assert.equal(context.metrics.workflowsInjected, 1);
    assert.equal(context.metrics.documentsInjected, 1);
    assert.ok(typeof context.metrics.promptSize === 'number');

    const snap = executor.snapshot();
    assert.ok(snap.prompt);
    assert.equal(snap.prompt.documentsCount, 1);
    assert.ok(snap.prompt.size > 0);
  });

  test('PromptRuntimeBridge - throws PromptAssemblyFailed when WorkUnit is missing', () => {
    const assembler = new PromptAssembler();
    const bridge = new PromptRuntimeBridge(assembler);

    const executor = new RuntimeExecutor();
    const context = executor.initialize('/workspace-root');

    assert.throws(() => {
      bridge.assemblePrompt(context);
    }, PromptAssemblyFailed);
  });

  test('PromptRuntimeBridge - maps timeout correctly', () => {
    // Simulamos um assembler que lança erro de timeout
    const fakeAssembler = {
      assemble: () => {
        throw new Error('timed out while compressing sections');
      }
    } as any;

    const bridge = new PromptRuntimeBridge(fakeAssembler);

    const executor = new RuntimeExecutor();
    const context = executor.initialize('/workspace-root');
    context.currentWorkUnit = sampleWorkUnit;

    assert.throws(() => {
      bridge.assemblePrompt(context);
    }, PromptAssemblyTimeout);
  });
});

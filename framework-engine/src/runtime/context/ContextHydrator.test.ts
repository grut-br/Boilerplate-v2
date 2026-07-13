import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { MarkdownLoader } from '../loader/MarkdownLoader.ts';
import { ContextBudget } from './ContextBudget.ts';
import { ContextHydrator } from './ContextHydrator.ts';
import { ContextResolver, InMemoryCapabilityRegistry } from './ContextResolver.ts';
import { HydrationError } from './HydrationErrors.ts';
import type { HydratedDocument, WorkUnit } from './types.ts';

async function fixture(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'framework-context-'));
  const directories = [
    '.agents/capabilities',
    '.agents/rules',
    '.agents/workflows',
    '.agents/knowledge',
    '.ai-workspace/specifications',
    '.ai-workspace/templates',
    '.ai-workspace/decisions',
  ];
  for (const directory of directories) {
    await mkdir(path.join(root, directory), { recursive: true });
  }
  await writeFile(path.join(root, '.agents/capabilities/ui.md'), '# UI capability\n', 'utf8');
  await writeFile(path.join(root, '.agents/rules/always-read.md'), '# Always read\n', 'utf8');
  await writeFile(path.join(root, '.agents/workflows/review.md'), '# Review workflow\n', 'utf8');
  await writeFile(path.join(root, '.agents/knowledge/accessibility.md'), '# Accessibility knowledge\n', 'utf8');
  await writeFile(path.join(root, '.ai-workspace/specifications/screen.md'), '# Screen specification\n', 'utf8');
  await writeFile(path.join(root, '.ai-workspace/templates/screen.md'), '# Screen template\n', 'utf8');
  await writeFile(path.join(root, '.ai-workspace/decisions/adr-001.md'), '# ADR 001\n', 'utf8');
  return root;
}

function registry(): InMemoryCapabilityRegistry {
  return new InMemoryCapabilityRegistry().register({
    name: 'ui',
    rules: ['always-read'],
    workflows: ['review'],
    knowledge: ['accessibility'],
    specifications: ['screen'],
    templates: ['screen'],
    adrs: ['adr-001'],
  });
}

test('resolves registry and Work Unit documents without duplicates', async () => {
  const root = await fixture();
  try {
    const loader = new MarkdownLoader({ startPath: root });
    const resolver = new ContextResolver(loader, registry());
    const requests = resolver.resolve({ id: 'WU-1', capability: 'ui', rules: ['always-read'] });
    assert.equal(requests.filter((request) => request.kind === 'rule').length, 1);
    assert.equal(requests[0].kind, 'capability');
    assert.equal(requests[0].required, true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('hydrates ordered context and assembles the final prompt', async () => {
  const root = await fixture();
  try {
    const loader = new MarkdownLoader({ startPath: root });
    const hydrator = new ContextHydrator(loader, registry(), { maxTokens: 1000 });
    const result = await hydrator.hydrate({
      id: 'WU-1',
      capability: 'ui',
      task: 'Build the screen.',
      systemPrompt: 'System instructions.',
    });
    assert.deepEqual(result.documents.slice(0, 2).map((document) => document.kind), ['capability', 'rule']);
    assert.match(result.sections.finalPayload, /SYSTEM PROMPT/);
    assert.match(result.sections.finalPayload, /CAPABILITY PROMPT/);
    assert.match(result.sections.finalPayload, /Build the screen/);
    assert.match(result.sections.finalPayload, /ADR 001/);
    assert.equal(result.snapshot.capability, 'ui');
    assert.equal(result.snapshot.loadedFiles.length, 7);
    assert.equal(result.snapshot.statistics.discardedDocuments, 0);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('keeps required documents and discards optional documents by priority', async () => {
  const root = await fixture();
  try {
    const loader = new MarkdownLoader({ startPath: root });
    const hydrator = new ContextHydrator(loader, registry(), { maxTokens: 8 });
    const result = await hydrator.hydrate({ id: 'WU-1', capability: 'ui', task: 'Task' });
    assert.equal(result.documents.some((document) => document.kind === 'capability'), true);
    assert.equal(result.documents.some((document) => document.kind === 'rule'), true);
    assert.equal(result.snapshot.statistics.discardedDocuments > 0, true);
    assert.equal(result.snapshot.warnings.some((warning) => warning.includes('budget')), true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('reports missing optional documents and rejects missing required documents', async () => {
  const root = await fixture();
  try {
    const loader = new MarkdownLoader({ startPath: root });
    const optional = new ContextHydrator(loader, registry(), { maxTokens: 100 });
    const optionalResult = await optional.hydrate({ id: 'WU-1', capability: 'ui', knowledge: ['missing'] });
    assert.equal(optionalResult.snapshot.warnings.some((warning) => warning.includes('missing')), true);

    const required = new ContextHydrator(loader, registry(), { maxTokens: 100 });
    await assert.rejects(
      () => required.hydrate({ id: 'WU-1', capability: 'ui', rules: [{ name: 'missing', required: true }] }),
      (error: unknown) => error instanceof HydrationError && error.code === 'REQUIRED_DOCUMENT_NOT_FOUND',
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('validates registry, work unit and budget inputs', () => {
  assert.throws(() => new ContextBudget(0), (error: unknown) => {
    return error instanceof HydrationError && error.code === 'CONTEXT_BUDGET_INVALID';
  });
  assert.throws(() => new ContextBudget(-1), (error: unknown) => {
    return error instanceof HydrationError && error.code === 'CONTEXT_BUDGET_INVALID';
  });
});

test('budget estimates content and prioritizes required documents', () => {
  const budget = new ContextBudget(5);
  const makeDocument = (name: string, priority: number, required: boolean, content: string): HydratedDocument => ({
    kind: 'knowledge',
    name,
    priority,
    required,
    path: `${name}.md`,
    estimatedTokens: 0,
    document: { name, path: `${name}.md`, content, loadedAt: 1 },
  });
  const result = budget.select([
    makeDocument('optional', 100, false, '12345678901234567890'),
    makeDocument('required', 1, true, '1234'),
  ]);
  assert.deepEqual(result.selected.map((document) => document.name), ['required']);
  assert.equal(result.discarded[0].name, 'optional');
});

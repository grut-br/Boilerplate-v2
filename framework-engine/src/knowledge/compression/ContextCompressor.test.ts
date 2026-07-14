/**
 * ContextCompressor.test.ts
 *
 * Testes da Context Compression Engine.
 * Cobrem: duplicação, ranking, prioridade, limites, normalização,
 * compressão, métricas, snapshot e pipeline completo.
 *
 * Sem dependência de IA. Determinístico.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { ContextCompressor } from './ContextCompressor.ts';
import { CompressionPipeline } from './CompressionPipeline.ts';
import { CompressionPolicy } from './CompressionPolicy.ts';
import { CompressionMetrics } from './CompressionMetrics.ts';
import { CompressionSnapshot } from './CompressionSnapshot.ts';
import { DuplicateDetector } from './DuplicateDetector.ts';
import { PrioritySelector } from './PrioritySelector.ts';
import { ContextNormalizer } from './ContextNormalizer.ts';
import {
  CompressionError,
  CompressionPolicyViolation,
  CompressionPipelineError,
  InvalidCompressionInput,
} from './CompressionErrors.ts';
import type { KnowledgeResult } from '../contracts/KnowledgeResult.ts';
import type { KnowledgeDocument } from '../contracts/KnowledgeDocument.ts';
import type { KnowledgeNode } from '../contracts/KnowledgeNode.ts';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeDoc(
  id: string,
  content = 'Sample content',
  path = `/docs/${id}.md`,
  meta: Record<string, any> = {}
): KnowledgeDocument {
  return { id, path, content, metadata: meta };
}

function makeNode(
  id: string,
  type = 'concept',
  props: Record<string, any> = {},
  meta: Record<string, any> = {}
): KnowledgeNode {
  return { id, type, properties: props, metadata: meta };
}

function makeResult(
  docs: KnowledgeDocument[] = [],
  nodes: KnowledgeNode[] = []
): KnowledgeResult {
  return {
    documents: docs,
    nodes,
    metadata: {},
    diagnostics: {},
    duration: 0,
  };
}

// ─── CompressionPolicy ────────────────────────────────────────────────────────

test('CompressionPolicy: defaults', () => {
  const policy = new CompressionPolicy();
  assert.ok(policy.maxTokens > 0);
  assert.ok(policy.maxDocuments > 0);
  assert.ok(policy.maxNodes > 0);
  assert.ok(policy.maxCharacters > 0);
  assert.ok(policy.maxSections > 0);
  assert.ok(policy.maxDepth > 0);
});

test('CompressionPolicy: custom limits', () => {
  const policy = new CompressionPolicy({
    maxTokens: 100,
    maxDocuments: 5,
    maxNodes: 10,
    maxCharacters: 500,
    maxSections: 3,
    maxDepth: 2,
  });
  assert.equal(policy.maxTokens, 100);
  assert.equal(policy.maxDocuments, 5);
  assert.equal(policy.maxNodes, 10);
  assert.equal(policy.maxCharacters, 500);
  assert.equal(policy.maxSections, 3);
  assert.equal(policy.maxDepth, 2);
});

test('CompressionPolicy: fits* predicates', () => {
  const policy = new CompressionPolicy({ maxTokens: 100, maxDocuments: 5 });
  assert.ok(policy.fitsTokens(100));
  assert.ok(!policy.fitsTokens(101));
  assert.ok(policy.fitsDocuments(5));
  assert.ok(!policy.fitsDocuments(6));
});

test('CompressionPolicy: toObject round-trip', () => {
  const opts = {
    maxTokens: 200,
    maxDocuments: 10,
    maxNodes: 20,
    maxCharacters: 1000,
    maxSections: 5,
    maxDepth: 3,
  };
  const policy = new CompressionPolicy(opts);
  assert.deepEqual(policy.toObject(), opts);
});

// ─── CompressionMetrics ───────────────────────────────────────────────────────

test('CompressionMetrics: initial state', () => {
  const metrics = new CompressionMetrics();
  const data = metrics.getMetrics();
  assert.equal(data.documentsRemoved, 0);
  assert.equal(data.duplicatesRemoved, 0);
  assert.equal(data.nodesRemoved, 0);
  assert.equal(data.estimatedTokensSaved, 0);
  assert.equal(data.compressionRatio, 0);
  assert.equal(data.executionTime, 0);
});

test('CompressionMetrics: record removals', () => {
  const metrics = new CompressionMetrics();
  metrics.recordDocumentsRemoved(3);
  metrics.recordNodesRemoved(2);
  const data = metrics.getMetrics();
  assert.equal(data.documentsRemoved, 3);
  assert.equal(data.nodesRemoved, 2);
});

test('CompressionMetrics: recordCompression ratio', () => {
  const metrics = new CompressionMetrics();
  metrics.recordCompression(1000, 500);
  const data = metrics.getMetrics();
  assert.equal(data.compressionRatio, 0.5);
  assert.equal(data.estimatedTokensSaved, 125); // 500 chars / 4
});

test('CompressionMetrics: recordCompression zero input', () => {
  const metrics = new CompressionMetrics();
  metrics.recordCompression(0, 0);
  const data = metrics.getMetrics();
  assert.equal(data.compressionRatio, 0);
});

test('CompressionMetrics: timer works', async () => {
  const metrics = new CompressionMetrics();
  metrics.startTimer();
  await new Promise((r) => setTimeout(r, 10));
  metrics.stopTimer();
  const data = metrics.getMetrics();
  assert.ok(data.executionTime >= 0);
});

test('CompressionMetrics: reset clears all counters', () => {
  const metrics = new CompressionMetrics();
  metrics.recordDocumentsRemoved(5);
  metrics.recordNodesRemoved(3);
  metrics.recordCompression(1000, 500);
  metrics.reset();
  const data = metrics.getMetrics();
  assert.equal(data.documentsRemoved, 0);
  assert.equal(data.nodesRemoved, 0);
  assert.equal(data.estimatedTokensSaved, 0);
});

// ─── CompressionSnapshot ──────────────────────────────────────────────────────

test('CompressionSnapshot: calculates diff and percentual', () => {
  const snap = new CompressionSnapshot();
  snap.recordBefore(10, 20, 4000);
  snap.recordAfter(5, 10, 2000);

  const data = snap.getSnapshot();

  assert.equal(data.before.documents, 10);
  assert.equal(data.after.documents, 5);
  assert.equal(data.diff.documents, 5);
  assert.equal(data.percentual.documents, 50);

  assert.equal(data.diff.characters, 2000);
  assert.equal(data.percentual.characters, 50);
});

test('CompressionSnapshot: zero before = zero percentual', () => {
  const snap = new CompressionSnapshot();
  snap.recordBefore(0, 0, 0);
  snap.recordAfter(5, 5, 100);

  const data = snap.getSnapshot();
  assert.equal(data.percentual.documents, 0);
  assert.equal(data.percentual.characters, 0);
});

test('CompressionSnapshot: estimatedTokens is chars/4', () => {
  const snap = new CompressionSnapshot();
  snap.recordBefore(1, 0, 400);
  snap.recordAfter(1, 0, 200);

  const data = snap.getSnapshot();
  assert.equal(data.before.estimatedTokens, 100);
  assert.equal(data.after.estimatedTokens, 50);
  assert.equal(data.diff.estimatedTokens, 50);
});

test('CompressionSnapshot: reset clears state', () => {
  const snap = new CompressionSnapshot();
  snap.recordBefore(10, 10, 1000);
  snap.recordAfter(5, 5, 500);
  snap.reset();

  const data = snap.getSnapshot();
  assert.equal(data.before.documents, 0);
  assert.equal(data.after.documents, 0);
});

// ─── DuplicateDetector ────────────────────────────────────────────────────────

test('DuplicateDetector: deduplicates by ID', () => {
  const detector = new DuplicateDetector();
  const docs = [
    makeDoc('doc-1', 'Content A'),
    makeDoc('doc-1', 'Content A'), // duplicate ID
    makeDoc('doc-2', 'Content B'),
  ];
  const result = detector.deduplicateDocuments(docs);
  assert.equal(result.documents.length, 2);
  assert.equal(result.removed, 1);
});

test('DuplicateDetector: deduplicates by path', () => {
  const detector = new DuplicateDetector();
  const docs = [
    makeDoc('doc-1', 'Content A', '/docs/file.md'),
    makeDoc('doc-2', 'Content A different', '/docs/file.md'), // same path
  ];
  const result = detector.deduplicateDocuments(docs);
  assert.equal(result.documents.length, 1);
  assert.equal(result.removed, 1);
});

test('DuplicateDetector: deduplicates by content hash', () => {
  const detector = new DuplicateDetector();
  const sameContent = 'Identical content block';
  const docs = [
    makeDoc('doc-1', sameContent, '/docs/a.md'),
    makeDoc('doc-2', sameContent, '/docs/b.md'), // same content, different path+id
  ];
  const result = detector.deduplicateDocuments(docs);
  assert.equal(result.documents.length, 1);
  assert.equal(result.removed, 1);
});

test('DuplicateDetector: deduplicates nodes by ID', () => {
  const detector = new DuplicateDetector();
  const nodes = [
    makeNode('node-1', 'concept', { name: 'Alpha' }),
    makeNode('node-1', 'concept', { name: 'Alpha' }), // duplicate ID + same props
    makeNode('node-2', 'concept', { name: 'Beta' }),  // different ID + different props
  ];
  const result = detector.deduplicateNodes(nodes);
  assert.equal(result.nodes.length, 2);  // node-1 e node-2
  assert.equal(result.removed, 1);       // apenas 1 duplicata removida
});

test('DuplicateDetector: deduplicates nodes by property hash', () => {
  const detector = new DuplicateDetector();
  const nodes = [
    makeNode('node-1', 'concept', { name: 'Foo', value: 42 }),
    makeNode('node-2', 'concept', { name: 'Foo', value: 42 }), // same props, different id
  ];
  const result = detector.deduplicateNodes(nodes);
  assert.equal(result.nodes.length, 1);
  assert.equal(result.removed, 1);
});

test('DuplicateDetector: detect() combines docs and nodes', () => {
  const detector = new DuplicateDetector();
  const docs = [
    makeDoc('d1', 'Content'),
    makeDoc('d1', 'Content'), // dup
  ];
  const nodes = [
    makeNode('n1'),
    makeNode('n1'), // dup
  ];
  const result = detector.detect(docs, nodes);
  assert.equal(result.documentsRemoved, 1);
  assert.equal(result.nodesRemoved, 1);
  assert.equal(result.documents.length, 1);
  assert.equal(result.nodes.length, 1);
});

test('DuplicateDetector: detectDuplicateHeaders', () => {
  const detector = new DuplicateDetector();
  const content = `# Introduction\n## Details\n# Introduction\n## Summary`;
  const dups = detector.detectDuplicateHeaders(content);
  assert.equal(dups.length, 1);
  assert.equal(dups[0], 'Introduction');
});

test('DuplicateDetector: detectDuplicateBlocks', () => {
  const detector = new DuplicateDetector();
  const content = `Block one paragraph.\n\nBlock two different.\n\nBlock one paragraph.`;
  const count = detector.detectDuplicateBlocks(content);
  assert.equal(count, 1);
});

test('DuplicateDetector: hashDocument is deterministic', () => {
  const detector = new DuplicateDetector();
  const doc = makeDoc('d1', 'Hello world');
  const h1 = detector.hashDocument(doc);
  const h2 = detector.hashDocument(doc);
  assert.equal(h1, h2);
});

test('DuplicateDetector: different content = different hash', () => {
  const detector = new DuplicateDetector();
  const h1 = detector.hashDocument(makeDoc('d1', 'Content A'));
  const h2 = detector.hashDocument(makeDoc('d2', 'Content B'));
  assert.notEqual(h1, h2);
});

// ─── PrioritySelector ─────────────────────────────────────────────────────────

test('PrioritySelector: selects documents by maxDocuments', () => {
  const selector = new PrioritySelector();
  const docs = [
    makeDoc('d1', 'C1'),
    makeDoc('d2', 'C2'),
    makeDoc('d3', 'C3'),
    makeDoc('d4', 'C4'),
  ];
  const result = selector.selectDocuments(docs, { maxDocuments: 2 });
  assert.equal(result.length, 2);
});

test('PrioritySelector: capability match boosts score', () => {
  const selector = new PrioritySelector();
  const docs = [
    makeDoc('d1', 'Low priority', '/d1.md', { capability: 'other' }),
    makeDoc('d2', 'High priority', '/d2.md', { capability: 'target-cap' }),
  ];
  const result = selector.selectDocuments(docs, {
    capability: 'target-cap',
    maxDocuments: 2,
  });
  assert.equal(result[0].id, 'd2'); // d2 deve vir primeiro
});

test('PrioritySelector: provider priority ordering', () => {
  const selector = new PrioritySelector();
  const docs = [
    makeDoc('d1', 'C1', '/d1.md', { provider: 'provider-b' }),
    makeDoc('d2', 'C2', '/d2.md', { provider: 'provider-a' }),
  ];
  const result = selector.selectDocuments(docs, {
    providerPriority: ['provider-a', 'provider-b'],
    maxDocuments: 2,
  });
  assert.equal(result[0].id, 'd2'); // provider-a tem prioridade maior
});

test('PrioritySelector: preferred type boost', () => {
  const selector = new PrioritySelector();
  const docs = [
    makeDoc('d1', 'C1', '/d1.md', { type: 'general' }),
    makeDoc('d2', 'C2', '/d2.md', { type: 'reference' }),
  ];
  const result = selector.selectDocuments(docs, {
    preferredType: 'reference',
    maxDocuments: 2,
  });
  assert.equal(result[0].id, 'd2');
});

test('PrioritySelector: score metadata boost', () => {
  const selector = new PrioritySelector();
  const docs = [
    makeDoc('d1', 'C1', '/d1.md', { score: 0.2 }),
    makeDoc('d2', 'C2', '/d2.md', { score: 0.9 }),
  ];
  const result = selector.selectDocuments(docs, { maxDocuments: 2 });
  assert.equal(result[0].id, 'd2');
});

test('PrioritySelector: selectNodes with maxNodes', () => {
  const selector = new PrioritySelector();
  const nodes = [
    makeNode('n1'),
    makeNode('n2'),
    makeNode('n3'),
  ];
  const result = selector.selectNodes(nodes, { maxNodes: 2 });
  assert.equal(result.length, 2);
});

// ─── ContextNormalizer ────────────────────────────────────────────────────────

test('ContextNormalizer: normalizes whitespace', () => {
  const normalizer = new ContextNormalizer();
  const text = 'Hello\n\n\n\nWorld\t!';
  const result = normalizer.normalizeWhitespace(text);
  assert.ok(!result.includes('\n\n\n'));
  assert.ok(!result.includes('\t'));
});

test('ContextNormalizer: normalizes headers depth', () => {
  const normalizer = new ContextNormalizer();
  const content = '#### Deep Header';
  const result = normalizer.normalizeHeaders(content, 2);
  assert.ok(result.startsWith('## '));
});

test('ContextNormalizer: normalizes links scheme', () => {
  const normalizer = new ContextNormalizer();
  const content = '[Link](HTTPS://example.com/page/)';
  const result = normalizer.normalizeLinks(content);
  assert.ok(result.includes('https://'));
  assert.ok(!result.endsWith('/)')); // trailing slash removido
});

test('ContextNormalizer: normalizes tags (lowercase, dedup, sort)', () => {
  const normalizer = new ContextNormalizer();
  const tags = ['TypeScript', 'javascript', 'TYPESCRIPT', 'React'];
  const result = normalizer.normalizeTags(tags);
  assert.deepEqual(result, ['javascript', 'react', 'typescript']);
});

test('ContextNormalizer: normalizes metadata removes null/undefined', () => {
  const normalizer = new ContextNormalizer();
  const meta = { key1: 'value', key2: null, key3: undefined, key4: 'true' };
  const result = normalizer.normalizeMetadata(meta);
  assert.ok(!('key2' in result));
  assert.ok(!('key3' in result));
  assert.equal(result.key4, true);
});

test('ContextNormalizer: normalizeDocument preserves logical content', () => {
  const normalizer = new ContextNormalizer();
  const doc = makeDoc(
    'test-doc',
    '## Header\n\n\nContent here.\n\n\nMore content.',
    '/test.md',
    { tags: ['TAG1', 'tag1'], type: 'guide' }
  );
  const result = normalizer.normalizeDocument(doc);
  assert.ok(result.content.includes('Content here.'));
  assert.ok(result.content.includes('More content.'));
  assert.ok(!result.content.includes('\n\n\n'));
});

test('ContextNormalizer: normalizeNode cleans null properties', () => {
  const normalizer = new ContextNormalizer();
  const node = makeNode('n1', 'CONCEPT', { name: 'Foo', empty: null });
  const result = normalizer.normalizeNode(node);
  assert.equal(result.type, 'concept');
  assert.ok(!('empty' in result.properties));
});

// ─── ContextCompressor ────────────────────────────────────────────────────────

test('ContextCompressor: compress empty result', () => {
  const compressor = new ContextCompressor();
  const result = compressor.compress(makeResult());
  assert.equal(result.result.documents.length, 0);
  assert.equal(result.result.nodes.length, 0);
  assert.ok(result.stages.length > 0);
});

test('ContextCompressor: compress throws on null input', () => {
  const compressor = new ContextCompressor();
  assert.throws(
    () => compressor.compress(null as any),
    InvalidCompressionInput
  );
});

test('ContextCompressor: removes duplicates in compress()', () => {
  const compressor = new ContextCompressor();
  const sameContent = 'Identical content that will be deduped';
  const docs = [
    makeDoc('d1', sameContent, '/d1.md'),
    makeDoc('d2', sameContent, '/d2.md'), // same content
    makeDoc('d3', 'Different content', '/d3.md'),
  ];
  const result = compressor.compress(makeResult(docs));
  assert.ok(result.result.documents.length < 3);
});

test('ContextCompressor: normalize() normalizes content', () => {
  const compressor = new ContextCompressor();
  const doc = makeDoc('d1', 'Hello\n\n\n\nWorld\t!');
  const r = compressor.normalize(makeResult([doc]));
  assert.ok(!r.documents[0].content.includes('\t'));
});

test('ContextCompressor: deduplicate() removes dups', () => {
  const compressor = new ContextCompressor();
  const docs = [
    makeDoc('d1', 'Same'),
    makeDoc('d1', 'Same'), // dup ID
  ];
  const r = compressor.deduplicate(makeResult(docs));
  assert.equal(r.documents.length, 1);
});

test('ContextCompressor: prioritize() orders documents', () => {
  const compressor = new ContextCompressor();
  const docs = [
    makeDoc('d1', 'C1', '/d1.md', { score: 0.1 }),
    makeDoc('d2', 'C2', '/d2.md', { score: 0.9 }),
    makeDoc('d3', 'C3', '/d3.md', { score: 0.5 }),
  ];
  const r = compressor.prioritize(makeResult(docs));
  assert.equal(r.documents[0].id, 'd2');
});

test('ContextCompressor: apply limits by maxDocuments', () => {
  const compressor = new ContextCompressor({ policy: { maxDocuments: 2 } });
  const docs = [
    makeDoc('d1', 'C1'),
    makeDoc('d2', 'C2'),
    makeDoc('d3', 'C3'),
  ];
  const result = compressor.compress(makeResult(docs));
  assert.ok(result.result.documents.length <= 2);
});

test('ContextCompressor: apply limits by maxCharacters', () => {
  const longContent = 'x'.repeat(500);
  const compressor = new ContextCompressor({
    policy: { maxCharacters: 600, maxDocuments: 10 },
  });
  const docs = [
    makeDoc('d1', longContent),
    makeDoc('d2', longContent),
    makeDoc('d3', longContent),
  ];
  const result = compressor.compress(makeResult(docs));
  const totalChars = result.result.documents.reduce(
    (acc, d) => acc + (d.content ?? '').length,
    0
  );
  assert.ok(totalChars <= 600);
});

test('ContextCompressor: measure() returns metrics', () => {
  const compressor = new ContextCompressor();
  compressor.compress(makeResult([makeDoc('d1', 'content')]));
  const metrics = compressor.measure();
  assert.ok(typeof metrics.compressionRatio === 'number');
  assert.ok(typeof metrics.executionTime === 'number');
});

test('ContextCompressor: snapshot has before and after', () => {
  const compressor = new ContextCompressor();
  const docs = [makeDoc('d1', 'Hello World'), makeDoc('d2', 'Other content')];
  const result = compressor.compress(makeResult(docs));
  assert.ok(result.snapshot.before.documents >= 0);
  assert.ok(result.snapshot.after.documents >= 0);
  assert.ok(typeof result.snapshot.percentual.documents === 'number');
});

test('ContextCompressor: stages list includes expected steps', () => {
  const compressor = new ContextCompressor();
  const result = compressor.compress(makeResult());
  assert.ok(result.stages.includes('normalize'));
  assert.ok(result.stages.includes('deduplicate'));
  assert.ok(result.stages.includes('prioritize'));
  assert.ok(result.stages.includes('apply-limits'));
  assert.ok(result.stages.includes('emit-result'));
});

test('ContextCompressor: policyApplied true when documents removed by limit', () => {
  const compressor = new ContextCompressor({ policy: { maxDocuments: 1 } });
  const docs = [makeDoc('d1', 'C1'), makeDoc('d2', 'C2')];
  const result = compressor.compress(makeResult(docs));
  assert.equal(result.policyApplied, true);
});

test('ContextCompressor: policyApplied false when nothing removed', () => {
  const compressor = new ContextCompressor({
    policy: { maxDocuments: 10, maxNodes: 10, maxCharacters: 10000 },
  });
  const docs = [makeDoc('d1', 'Small content')];
  const result = compressor.compress(makeResult(docs));
  assert.equal(result.policyApplied, false);
});

// ─── CompressionPipeline ─────────────────────────────────────────────────────

test('CompressionPipeline: run() empty result', () => {
  const pipeline = new CompressionPipeline();
  const result = pipeline.run(makeResult());
  assert.equal(result.result.documents.length, 0);
  assert.ok(result.stages.length > 0);
});

test('CompressionPipeline: run() with deduplication', () => {
  const pipeline = new CompressionPipeline();
  const content = 'Repeated content';
  const docs = [
    makeDoc('d1', content, '/d1.md'),
    makeDoc('d2', content, '/d2.md'),
  ];
  const result = pipeline.run(makeResult(docs));
  assert.ok(result.result.documents.length < 2);
});

test('CompressionPipeline: run() respects maxDocuments policy', () => {
  const pipeline = new CompressionPipeline({ policy: { maxDocuments: 2 } });
  const docs = [
    makeDoc('d1', 'A'),
    makeDoc('d2', 'B'),
    makeDoc('d3', 'C'),
    makeDoc('d4', 'D'),
  ];
  const result = pipeline.run(makeResult(docs));
  assert.ok(result.result.documents.length <= 2);
});

test('CompressionPipeline: run() with trace', () => {
  const pipeline = new CompressionPipeline();
  const docs = [makeDoc('d1', 'Content'), makeDoc('d2', 'Other')];
  const result = pipeline.run(makeResult(docs), { trace: true });
  assert.ok(result.trace !== undefined);
  assert.ok(Array.isArray(result.trace));
  assert.ok(result.trace!.length > 0);
  // Verifica que cada stage tem nome
  for (const stage of result.trace!) {
    assert.ok(typeof stage.name === 'string');
    assert.ok(stage.name.length > 0);
  }
});

test('CompressionPipeline: runBatch() merges multiple results', () => {
  const pipeline = new CompressionPipeline();
  const batch = [
    makeResult([makeDoc('d1', 'Batch A content')]),
    makeResult([makeDoc('d2', 'Batch B content')]),
    makeResult([makeDoc('d3', 'Batch C content')]),
  ];
  const result = pipeline.runBatch(batch);
  assert.ok(result.result.documents.length <= 3);
  assert.ok(result.stages.includes('normalize'));
});

test('CompressionPipeline: runBatch() empty list returns empty result', () => {
  const pipeline = new CompressionPipeline();
  const result = pipeline.runBatch([]);
  assert.equal(result.result.documents.length, 0);
});

test('CompressionPipeline: getPolicy() returns configured policy', () => {
  const pipeline = new CompressionPipeline({ policy: { maxDocuments: 7 } });
  const policy = pipeline.getPolicy();
  assert.equal(policy.maxDocuments, 7);
});

// ─── CompressionErrors ────────────────────────────────────────────────────────

test('CompressionErrors: CompressionError is base class', () => {
  const err = new CompressionError('base error');
  assert.ok(err instanceof Error);
  assert.equal(err.name, 'CompressionError');
  assert.equal(err.message, 'base error');
});

test('CompressionErrors: CompressionPolicyViolation has metadata', () => {
  const err = new CompressionPolicyViolation('maxDocuments', 25, 20);
  assert.ok(err instanceof CompressionError);
  assert.equal(err.policy, 'maxDocuments');
  assert.equal(err.actual, 25);
  assert.equal(err.limit, 20);
  assert.ok(err.message.includes('maxDocuments'));
});

test('CompressionErrors: CompressionPipelineError has stage', () => {
  const err = new CompressionPipelineError('normalize', 'failed to parse');
  assert.equal(err.stage, 'normalize');
  assert.ok(err.message.includes('normalize'));
  assert.ok(err.message.includes('failed to parse'));
});

test('CompressionErrors: InvalidCompressionInput prefix', () => {
  const err = new InvalidCompressionInput('null result');
  assert.ok(err.message.includes('Invalid compression input'));
  assert.ok(err.message.includes('null result'));
});

// ─── Full Pipeline Integration ────────────────────────────────────────────────

test('Full pipeline: normalize + deduplicate + prioritize + limits', () => {
  const pipeline = new CompressionPipeline({
    policy: {
      maxDocuments: 3,
      maxNodes: 2,
      maxCharacters: 5000,
      maxTokens: 1250,
    },
    priority: {
      capability: 'coding',
      providerPriority: ['provider-a', 'provider-b'],
      preferredType: 'reference',
    },
  });

  const duplicateContent = 'Shared duplicate content block';

  const docs: KnowledgeDocument[] = [
    makeDoc('d1', duplicateContent, '/d1.md', { provider: 'provider-a', capability: 'coding', type: 'reference', score: 0.9 }),
    makeDoc('d2', duplicateContent, '/d2.md', { provider: 'provider-b', capability: 'other', type: 'general', score: 0.3 }),
    makeDoc('d3', 'Unique content C', '/d3.md', { provider: 'provider-a', capability: 'coding', score: 0.7 }),
    makeDoc('d4', 'Unique content D', '/d4.md', { provider: 'provider-b', score: 0.5 }),
    makeDoc('d5', 'Unique content E\n\n\n\nWith bad whitespace\t!', '/d5.md', {}),
  ];

  const nodes: KnowledgeNode[] = [
    makeNode('n1', 'CONCEPT', { name: 'Alpha', value: null }),
    makeNode('n2', 'concept', { name: 'Beta' }, { provider: 'provider-a' }),
    makeNode('n1', 'concept', { name: 'Alpha' }), // duplicate ID
  ];

  const input = makeResult(docs, nodes);
  const result = pipeline.run(input);

  // Limites respeitados
  assert.ok(result.result.documents.length <= 3);
  assert.ok(result.result.nodes.length <= 2);

  // Snapshot está presente
  assert.ok(result.snapshot.before.documents > 0);
  assert.ok(result.snapshot.after.documents >= 0);

  // Métricas registradas
  assert.ok(typeof result.metrics.compressionRatio === 'number');
  assert.ok(result.metrics.executionTime >= 0);

  // Whitespace normalizado
  for (const doc of result.result.documents) {
    assert.ok(!doc.content.includes('\t'), 'Tab found in normalized doc');
    assert.ok(!doc.content.includes('\n\n\n'), 'Triple newline found');
  }

  // Node null properties removidos
  for (const node of result.result.nodes) {
    for (const val of Object.values(node.properties)) {
      assert.notEqual(val, null);
    }
  }
});

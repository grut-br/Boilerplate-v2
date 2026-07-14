import assert from 'node:assert/strict';
import test from 'node:test';
import { KnowledgeResolver } from './KnowledgeResolver.ts';
import { KnowledgeFilter } from './KnowledgeFilter.ts';
import { KnowledgeRanking } from './KnowledgeRanking.ts';
import { DefaultResolutionStrategy } from './KnowledgeResolutionStrategy.ts';
import type { KnowledgeResult } from '../contracts/KnowledgeResult.ts';

test('KnowledgeRanking - scoring and sorting by priority, tags, type, metadata and limit', () => {
  const ranking = new KnowledgeRanking({
    providerId: 'markdown',
    providerPriority: 2,
    targetType: 'architecture',
    targetMetadata: { priority: 'high' },
    targetTags: ['typescript', 'node'],
  });

  const docs = [
    { id: 'low-score', path: 'file1.md', content: 'test', metadata: {} },
    { id: 'mid-score', path: 'file2.md', content: 'test', metadata: { type: 'architecture', tags: ['typescript'] } },
    { id: 'high-score', path: 'file3.md', content: 'test', metadata: { type: 'architecture', priority: 'high', tags: ['typescript', 'node'] } },
  ];

  const ranked = ranking.rank(docs, { providerId: 'markdown', providerPriority: 2 });
  assert.equal(ranked[0].id, 'high-score');
  assert.equal(ranked[1].id, 'mid-score');
  assert.equal(ranked[2].id, 'low-score');

  const limited = ranking.rank(docs, { providerId: 'markdown', providerPriority: 2 }, 1);
  assert.equal(limited.length, 1);
  assert.equal(limited[0].id, 'high-score');
});

test('KnowledgeFilter - filters by extension, type, category, metadata and tags', () => {
  const filter = new KnowledgeFilter();
  const docs = [
    { id: 'd1', path: 'dir/file.md', content: 'test', metadata: { type: 'doc', category: 'architecture', tags: ['ts'] } },
    { id: 'd2', path: 'dir/file.txt', content: 'test', metadata: { type: 'guide', category: 'api', tags: ['rust'] } },
    { id: 'd3', path: 'dir/file2.md', content: 'test', metadata: { type: 'doc', category: 'api', tags: ['ts', 'node'] } },
  ];

  const byExt = filter.filter(docs, { extension: 'md' });
  assert.equal(byExt.length, 2);
  assert.equal(byExt[0].id, 'd1');
  assert.equal(byExt[1].id, 'd3');

  const byType = filter.filter(docs, { type: 'guide' });
  assert.equal(byType.length, 1);
  assert.equal(byType[0].id, 'd2');

  const byCat = filter.filter(docs, { category: 'api' });
  assert.equal(byCat.length, 2);
  assert.equal(byCat[0].id, 'd2');
  assert.equal(byCat[1].id, 'd3');

  const byTags = filter.filter(docs, { tags: ['ts'] });
  assert.equal(byTags.length, 2);

  const byMultipleTags = filter.filter(docs, { tags: ['ts', 'node'] });
  assert.equal(byMultipleTags.length, 1);
  assert.equal(byMultipleTags[0].id, 'd3');
});

test('KnowledgeResolver - E2E resolution, strategy and metrics', () => {
  const strategy = new DefaultResolutionStrategy({
    filter: { extension: 'md' },
    ranking: {
      providerPriority: 3,
      targetTags: ['core'],
      maxDocuments: 2,
    }
  });

  const resolver = new KnowledgeResolver(strategy);

  const rawResult: KnowledgeResult = {
    documents: [
      { id: 'd1', path: 'file1.txt', content: 'txt file', metadata: { tags: ['core'] } },
      { id: 'd2', path: 'file2.md', content: 'md file 2', metadata: { tags: ['core'] } },
      { id: 'd3', path: 'file3.md', content: 'md file 3', metadata: { tags: [] } },
      { id: 'd4', path: 'file4.md', content: 'md file 4', metadata: { tags: ['core', 'extra'] } },
    ],
    nodes: [],
    metadata: {},
    diagnostics: {},
    duration: 12,
  };

  const resolved = resolver.resolve(rawResult, 3);

  assert.equal(resolved.documents.length, 2);
  assert.ok(resolved.documents.some(d => d.id === 'd2'));
  assert.ok(resolved.documents.some(d => d.id === 'd4'));
  assert.ok(!resolved.documents.some(d => d.id === 'd3'));
  assert.ok(!resolved.documents.some(d => d.id === 'd1'));

  const metrics = resolver.getMetrics();
  const entries = metrics.getEntries();
  assert.equal(entries.length, 1);
  assert.equal(entries[0].documentsReceived, 4);
  assert.equal(entries[0].documentsSelected, 2);
  assert.equal(entries[0].documentsDiscarded, 2);
  assert.ok(entries[0].executionTime >= 0);
  assert.ok(entries[0].rankingTime >= 0);
  assert.ok(entries[0].filterTime >= 0);
});

test('KnowledgeResolver - handles empty results', () => {
  const resolver = new KnowledgeResolver();
  const emptyResult: KnowledgeResult = {
    documents: [],
    nodes: [],
    metadata: {},
    diagnostics: {},
    duration: 0,
  };

  const resolved = resolver.resolve(emptyResult);
  assert.equal(resolved.documents.length, 0);

  const metrics = resolver.getMetrics().getEntries();
  assert.equal(metrics[0].documentsReceived, 0);
  assert.equal(metrics[0].documentsSelected, 0);
  assert.equal(metrics[0].documentsDiscarded, 0);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { KnowledgeComposer } from './KnowledgeComposer.ts';
import { KnowledgeAggregation } from './KnowledgeAggregation.ts';
import { KnowledgePriority } from './KnowledgePriority.ts';
import { KnowledgeSelection } from './KnowledgeSelection.ts';
import type { KnowledgeResult } from '../contracts/KnowledgeResult.ts';

test('KnowledgePriority - default priorities and sorting', () => {
  const priority = new KnowledgePriority();
  assert.equal(priority.getPriority('markdown'), 1);
  assert.equal(priority.getPriority('unregistered'), 0);

  priority.setPriority('vector', 5);
  assert.equal(priority.getPriority('vector'), 5);

  const items = [
    { id: 'item1', provider: 'markdown' },
    { id: 'item2', provider: 'vector' },
  ];
  const sorted = priority.sort(items, (x) => x.provider);
  assert.equal(sorted[0].id, 'item2');
  assert.equal(sorted[1].id, 'item1');
});

test('KnowledgeAggregation - merge documents, metadata and diagnostics with duplicate resolution', () => {
  const priority = new KnowledgePriority();
  priority.setPriority('low-priority', 1);
  priority.setPriority('high-priority', 10);

  const agg = new KnowledgeAggregation(priority);

  const resultLow: KnowledgeResult = {
    documents: [
      { id: 'doc-dup', path: 'path/low.md', content: 'low priority content', metadata: { source: 'low' } },
      { id: 'doc-low-unique', path: 'path/unique-low.md', content: 'unique low', metadata: {} },
    ],
    nodes: [
      { id: 'node-dup', type: 'concept', properties: { value: 'low' }, metadata: {} },
    ],
    metadata: { key1: 'low-val', key2: 'low-val-2' },
    diagnostics: { scanTime: 10 },
    duration: 5,
  };

  const resultHigh: KnowledgeResult = {
    documents: [
      { id: 'doc-dup', path: 'path/high.md', content: 'high priority content', metadata: { source: 'high' } },
      { id: 'doc-high-unique', path: 'path/unique-high.md', content: 'unique high', metadata: {} },
    ],
    nodes: [
      { id: 'node-dup', type: 'concept', properties: { value: 'high' }, metadata: {} },
    ],
    metadata: { key1: 'high-val', key3: 'high-val-3' },
    diagnostics: { scanTime: 20 },
    duration: 15,
  };

  const merged = agg.merge([
    { providerId: 'low-priority', result: resultLow },
    { providerId: 'high-priority', result: resultHigh },
  ]);

  assert.equal(merged.documents.length, 3);
  
  const dupDoc = merged.documents.find(d => d.id === 'doc-dup');
  assert.ok(dupDoc);
  assert.equal(dupDoc.content, 'high priority content');
  assert.equal(dupDoc.metadata.source, 'high');

  assert.equal(merged.nodes.length, 1);
  assert.equal(merged.nodes[0].properties.value, 'high');

  assert.equal(merged.metadata.key1, 'high-val');
  assert.equal(merged.metadata.key2, 'low-val-2');
  assert.equal(merged.metadata.key3, 'high-val-3');

  assert.equal(merged.duration, 20);
});

test('KnowledgeSelection - filtering by type, metadata, tags, limit', () => {
  const select = new KnowledgeSelection();

  const documents = [
    { id: 'd1', path: 'dir/file.md', content: 'hello', metadata: { category: 'architecture', tags: ['typescript', 'node'] } },
    { id: 'd2', path: 'dir/file.txt', content: 'world', metadata: { category: 'guide', tags: ['typescript'] } },
    { id: 'd3', path: 'dir/file3.md', content: 'test', metadata: { category: 'architecture', tags: ['rust'] } },
  ];

  const byType = select.selectDocuments(documents, { type: 'md' });
  assert.equal(byType.length, 2);
  assert.equal(byType[0].id, 'd1');
  assert.equal(byType[1].id, 'd3');

  const byMeta = select.selectDocuments(documents, { metadata: { category: 'guide' } });
  assert.equal(byMeta.length, 1);
  assert.equal(byMeta[0].id, 'd2');

  const byTag = select.selectDocuments(documents, { tags: ['typescript'] });
  assert.equal(byTag.length, 2);
  
  const byMultipleTags = select.selectDocuments(documents, { tags: ['typescript', 'node'] });
  assert.equal(byMultipleTags.length, 1);
  assert.equal(byMultipleTags[0].id, 'd1');

  const limited = select.selectDocuments(documents, { limit: 1 });
  assert.equal(limited.length, 1);
  assert.equal(limited[0].id, 'd1');
});

test('KnowledgeComposer - end-to-end composer execution with selection', () => {
  const composer = new KnowledgeComposer();
  const results = [
    {
      providerId: 'markdown',
      result: {
        documents: [
          { id: 'doc1', path: 'doc1.md', content: 'content 1', metadata: { tags: ['test'] } },
          { id: 'doc2', path: 'doc2.md', content: 'content 2', metadata: { tags: ['guide'] } },
        ],
        nodes: [],
        metadata: {},
        diagnostics: {},
        duration: 10,
      }
    }
  ];

  const composed = composer.compose(results, { tags: ['test'] });
  assert.equal(composed.documents.length, 1);
  assert.equal(composed.documents[0].id, 'doc1');
});

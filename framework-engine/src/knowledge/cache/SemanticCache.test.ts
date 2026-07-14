import assert from 'node:assert/strict';
import test from 'node:test';
import { SemanticCache } from './SemanticCache.ts';
import { CacheHasher } from './CacheHasher.ts';
import type { KnowledgeRequest } from '../contracts/KnowledgeRequest.ts';
import type { KnowledgeResult } from '../contracts/KnowledgeResult.ts';

test('CacheHasher - deterministic stable hashing', () => {
  const hasher = new CacheHasher();

  const req1: KnowledgeRequest = {
    query: 'get databases',
    workspace: '/workspace',
    filters: { limit: 10, category: 'db' },
    metadata: { extra: true },
    capability: 'semanticSearch',
  };

  const req2: KnowledgeRequest = {
    query: 'get databases ',
    workspace: '/WORKSPACE',
    filters: { category: 'db', limit: 10 },
    metadata: { extra: true },
    capability: 'SEMANTICSEARCH',
  };

  const hash1 = hasher.hash({ ...req1, provider: 'markdown' });
  const hash2 = hasher.hash({ ...req2, provider: 'MARKDOWN' });

  assert.equal(hash1, hash2);
});

test('SemanticCache - Put, Get, Hit, Miss and metrics tracking', () => {
  const cache = new SemanticCache({ ttl: 60000 });

  const request: KnowledgeRequest = {
    query: 'query-1',
    workspace: '/ws',
  };

  const result: KnowledgeResult = {
    documents: [{ id: 'doc-1', path: 'file.md', content: 'hello', metadata: { tags: ['tech'] } }],
    nodes: [],
    metadata: {},
    diagnostics: {},
    duration: 5,
  };

  const missResult = cache.get(request, 'markdown');
  assert.equal(missResult, undefined);

  cache.put(request, result, 'markdown');

  const hitResult = cache.get(request, 'markdown');
  assert.ok(hitResult);
  assert.equal(hitResult.documents[0].id, 'doc-1');

  const stats = cache.stats();
  assert.equal(stats.cacheHits, 1);
  assert.equal(stats.cacheMisses, 1);
  assert.equal(stats.savedProviderCalls, 1);
  assert.ok(stats.savedTokensEstimated > 0);
});

test('SemanticCache - TTL expiration', async () => {
  const cache = new SemanticCache({ ttl: 5 });

  const request: KnowledgeRequest = {
    query: 'query-1',
    workspace: '/ws',
  };

  const result: KnowledgeResult = {
    documents: [],
    nodes: [],
    metadata: {},
    diagnostics: {},
    duration: 5,
  };

  cache.put(request, result);
  assert.equal(cache.has(request), true);

  await new Promise(resolve => setTimeout(resolve, 10));

  assert.equal(cache.has(request), false);
  assert.equal(cache.get(request), undefined);

  assert.equal(cache.stats().evictions, 1);
});

test('SemanticCache - Capacity enforcement and LRU eviction', () => {
  const cache = new SemanticCache({ maxEntries: 2 });

  const r1 = { query: 'q1', workspace: '/ws' };
  const r2 = { query: 'q2', workspace: '/ws' };
  const r3 = { query: 'q3', workspace: '/ws' };
  const res = { documents: [], nodes: [], metadata: {}, diagnostics: {}, duration: 0 };

  cache.put(r1, res, 'markdown');
  cache.put(r2, res, 'markdown');

  cache.get(r1, 'markdown');

  cache.put(r3, res, 'markdown');

  assert.equal(cache.has(r1, 'markdown'), true);
  assert.equal(cache.has(r2, 'markdown'), false);
  assert.equal(cache.has(r3, 'markdown'), true);
});

test('SemanticCache - Invalidations by Provider, Workspace and Document ID', () => {
  const cache = new SemanticCache();

  const r1 = { query: 'q1', workspace: '/ws1' };
  const r2 = { query: 'q2', workspace: '/ws2' };
  
  const res1 = { documents: [{ id: 'doc-1', path: 'f1.md', content: 'text', metadata: {} }], nodes: [], metadata: {}, diagnostics: {}, duration: 0 };
  const res2 = { documents: [{ id: 'doc-2', path: 'f2.md', content: 'text', metadata: {} }], nodes: [], metadata: {}, diagnostics: {}, duration: 0 };

  cache.put(r1, res1, 'markdown');
  cache.put(r2, res2, 'graphify');

  cache.invalidateProvider('markdown');
  assert.equal(cache.has(r1, 'markdown'), false);
  assert.equal(cache.has(r2, 'graphify'), true);

  cache.clear();
  cache.put(r1, res1, 'markdown');
  cache.put(r2, res2, 'graphify');

  cache.invalidateWorkspace('/ws2');
  assert.equal(cache.has(r1, 'markdown'), true);
  assert.equal(cache.has(r2, 'graphify'), false);

  cache.clear();
  cache.put(r1, res1, 'markdown');
  cache.put(r2, res2, 'graphify');

  cache.invalidateDocument('doc-1');
  assert.equal(cache.has(r1, 'markdown'), false);
  assert.equal(cache.has(r2, 'graphify'), true);
});

test('SemanticCache - Snapshot exporting', () => {
  const cache = new SemanticCache();
  const req = { query: 'q', workspace: '/ws' };
  const res = { documents: [], nodes: [], metadata: {}, diagnostics: {}, duration: 0 };
  
  cache.put(req, res);

  const snap = cache.snapshot();
  assert.equal(snap.entriesCount, 1);
  assert.equal(snap.entries[0].request.query, 'q');
  assert.ok(snap.timestamp > 0);
});

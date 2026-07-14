import type { KnowledgeRequest } from '../contracts/KnowledgeRequest.ts';
import type { KnowledgeResult } from '../contracts/KnowledgeResult.ts';
import { CacheHasher } from './CacheHasher.ts';
import { CacheIndex } from './CacheIndex.ts';
import { CacheMetrics, type CacheMetricsData } from './CacheMetrics.ts';
import { CachePolicy, type CachePolicyOptions } from './CachePolicy.ts';
import { CacheEviction } from './CacheEviction.ts';
import type { CacheEntry } from './CacheEntry.ts';
import type { CacheSnapshot } from './CacheSnapshot.ts';

export class SemanticCache {
  private readonly entries = new Map<string, CacheEntry>();
  private readonly hasher = new CacheHasher();
  private readonly index = new CacheIndex();
  private readonly metrics = new CacheMetrics();
  private readonly policy: CachePolicy;
  private readonly eviction: CacheEviction;
  private logicalClock = 0;

  constructor(options?: CachePolicyOptions) {
    this.policy = new CachePolicy(options);
    this.eviction = new CacheEviction(this.entries, this.index, this.policy);
  }

  get(request: KnowledgeRequest, providerId = 'unknown'): KnowledgeResult | undefined {
    const start = Date.now();
    const hash = this.hasher.hash({ ...request, provider: providerId });

    this.cleanExpired();

    const entry = this.entries.get(hash);
    if (!entry) {
      this.metrics.incrementMisses();
      this.metrics.recordLookup(Date.now() - start);
      return undefined;
    }

    entry.hits++;
    entry.lastAccess = ++this.logicalClock;
    
    this.metrics.incrementHits();
    this.metrics.recordLookup(Date.now() - start);
    return entry.result;
  }

  put(request: KnowledgeRequest, result: KnowledgeResult, providerId = 'unknown'): void {
    const start = Date.now();
    const hash = this.hasher.hash({ ...request, provider: providerId });

    const workspace = request.workspace;

    if (this.entries.has(hash)) {
      this.delete(hash);
    }

    this.cleanExpired();
    this.enforceCapacity();

    const documentIds = (result.documents ?? []).map(doc => doc.id);
    const tagsSet = new Set<string>();
    for (const doc of result.documents ?? []) {
      const tags = doc.metadata.tags || doc.metadata.keywords || [];
      if (Array.isArray(tags)) {
        for (const tag of tags) {
          tagsSet.add(tag);
        }
      }
    }

    const entry: CacheEntry = {
      request,
      result,
      provider: providerId,
      timestamp: Date.now(),
      ttl: this.policy.ttl,
      hash,
      hits: 0,
      lastAccess: ++this.logicalClock,
      metadata: {},
    };

    this.entries.set(hash, entry);
    this.index.index(hash, providerId, workspace, documentIds, Array.from(tagsSet), request.capability);

    const textLength = JSON.stringify(result).length;
    this.metrics.recordInsert(Date.now() - start, textLength);
  }

  has(request: KnowledgeRequest, providerId = 'unknown'): boolean {
    this.cleanExpired();
    const hash = this.hasher.hash({ ...request, provider: providerId });
    return this.entries.has(hash);
  }

  delete(hash: string): boolean {
    const entry = this.entries.get(hash);
    if (!entry) return false;

    const documentIds = (entry.result.documents ?? []).map(doc => doc.id);
    const tagsSet = new Set<string>();
    for (const doc of entry.result.documents ?? []) {
      const tags = doc.metadata.tags || doc.metadata.keywords || [];
      if (Array.isArray(tags)) {
        for (const tag of tags) {
          tagsSet.add(tag);
        }
      }
    }

    this.index.deindex(hash, entry.provider, entry.request.workspace, documentIds, Array.from(tagsSet), entry.request.capability);
    return this.entries.delete(hash);
  }

  clear(): void {
    this.entries.clear();
    this.index.clear();
    this.metrics.clear();
  }

  invalidate(request: KnowledgeRequest, providerId = 'unknown'): boolean {
    const hash = this.hasher.hash({ ...request, provider: providerId });
    return this.delete(hash);
  }

  invalidateProvider(providerId: string): void {
    const hashes = this.eviction.invalidateProvider(providerId);
    for (const hash of hashes) {
      this.delete(hash);
    }
  }

  invalidateWorkspace(workspace: string): void {
    const hashes = this.eviction.invalidateWorkspace(workspace);
    for (const hash of hashes) {
      this.delete(hash);
    }
  }

  invalidateDocument(docId: string): void {
    const hashes = this.eviction.invalidateDocument(docId);
    for (const hash of hashes) {
      this.delete(hash);
    }
  }

  stats(): CacheMetricsData {
    return this.metrics.getMetrics(this.entries.size);
  }

  snapshot(): CacheSnapshot {
    return {
      timestamp: Date.now(),
      entriesCount: this.entries.size,
      entries: Array.from(this.entries.values()),
      metrics: this.stats(),
    };
  }

  private cleanExpired(): void {
    const expiredHashes = this.eviction.evictExpired();
    for (const hash of expiredHashes) {
      this.delete(hash);
      this.metrics.incrementEvictions();
    }
  }

  private enforceCapacity(): void {
    while (this.entries.size >= this.policy.maxEntries) {
      const hashToEvict = this.eviction.evictLRU();
      if (!hashToEvict) break;
      this.delete(hashToEvict);
      this.metrics.incrementEvictions();
    }
  }
}

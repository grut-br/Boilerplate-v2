import type { CacheEntry } from './CacheEntry.ts';
import { CacheIndex } from './CacheIndex.ts';
import { CachePolicy } from './CachePolicy.ts';

export class CacheEviction {
  private readonly entries: Map<string, CacheEntry>;
  private readonly index: CacheIndex;
  private readonly policy: CachePolicy;

  constructor(entries: Map<string, CacheEntry>, index: CacheIndex, policy: CachePolicy) {
    this.entries = entries;
    this.index = index;
    this.policy = policy;
  }

  evictExpired(): string[] {
    const expiredHashes: string[] = [];
    for (const entry of this.entries.values()) {
      if (this.policy.isExpired(entry.timestamp, entry.ttl)) {
        expiredHashes.push(entry.hash);
      }
    }
    return expiredHashes;
  }

  evictLRU(): string | undefined {
    if (this.entries.size === 0) return undefined;

    let oldestHash: string | undefined = undefined;
    let oldestAccess = Infinity;
    let lowestPriority = Infinity;

    for (const entry of this.entries.values()) {
      const providerPriority = this.policy.getPriority(entry.provider);
      
      if (providerPriority < lowestPriority) {
        lowestPriority = providerPriority;
        oldestAccess = entry.lastAccess;
        oldestHash = entry.hash;
      } else if (providerPriority === lowestPriority && entry.lastAccess < oldestAccess) {
        oldestAccess = entry.lastAccess;
        oldestHash = entry.hash;
      }
    }

    return oldestHash;
  }

  invalidateProvider(providerId: string): string[] {
    const pId = providerId.toLowerCase();
    const hashes = this.index.byProvider.get(pId);
    return hashes ? Array.from(hashes) : [];
  }

  invalidateWorkspace(workspace: string): string[] {
    const ws = workspace.toLowerCase();
    const hashes = this.index.byWorkspace.get(ws);
    return hashes ? Array.from(hashes) : [];
  }

  invalidateDocument(docId: string): string[] {
    const doc = docId.toLowerCase();
    const hashes = this.index.byDocument.get(doc);
    return hashes ? Array.from(hashes) : [];
  }
}

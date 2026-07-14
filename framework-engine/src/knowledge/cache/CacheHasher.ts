import { createHash } from 'node:crypto';

export class CacheHasher {
  hash(request: {
    query: string;
    provider?: string;
    workspace: string;
    filters?: Record<string, any>;
    metadata?: Record<string, any>;
    capability?: string;
  }): string {
    const stableObject = {
      query: request.query.trim().toLowerCase(),
      provider: (request.provider ?? 'unknown').toLowerCase(),
      workspace: request.workspace.trim().toLowerCase(),
      capability: (request.capability ?? '').toLowerCase(),
      filters: this.sortKeys(request.filters ?? {}),
      metadata: this.sortKeys(request.metadata ?? {}),
    };

    const serialized = this.serializeStable(stableObject);
    return createHash('sha256').update(serialized).digest('hex');
  }

  private sortKeys(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.sortKeys(item));
    }
    const sortedKeys = Object.keys(obj).sort();
    const result: any = {};
    for (const key of sortedKeys) {
      result[key] = this.sortKeys(obj[key]);
    }
    return result;
  }

  private serializeStable(obj: any): string {
    if (obj === null || typeof obj !== 'object') {
      return String(obj);
    }
    if (Array.isArray(obj)) {
      return '[' + obj.map(item => this.serializeStable(item)).join(',') + ']';
    }
    const keys = Object.keys(obj);
    return '{' + keys.map(key => `${key}:${this.serializeStable(obj[key])}`).join(',') + '}';
  }
}

export interface CachePolicyOptions {
  ttl?: number;
  maxEntries?: number;
  maxMemory?: number;
  priorityMap?: Record<string, number>;
}

export class CachePolicy {
  readonly ttl: number;
  readonly maxEntries: number;
  readonly maxMemory: number;
  readonly priorityMap: Map<string, number>;

  constructor(options?: CachePolicyOptions) {
    this.ttl = options?.ttl ?? 600000;
    this.maxEntries = options?.maxEntries ?? 1000;
    this.maxMemory = options?.maxMemory ?? 10 * 1024 * 1024;
    this.priorityMap = new Map<string, number>();

    if (options?.priorityMap) {
      for (const [key, val] of Object.entries(options.priorityMap)) {
        this.priorityMap.set(key.toLowerCase(), val);
      }
    }
  }

  getPriority(key: string): number {
    return this.priorityMap.get(key.toLowerCase()) ?? 1;
  }

  isExpired(timestamp: number, ttl = this.ttl): boolean {
    return Date.now() - timestamp > ttl;
  }
}

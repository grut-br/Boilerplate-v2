import path from 'node:path';

export interface CachedDocument<T> {
  document: T;
  loadedAt: number;
}

export class DocumentCache<T = unknown> {
  private readonly entries = new Map<string, CachedDocument<T>>();

  get(filePath: string): CachedDocument<T> | undefined {
    return this.entries.get(this.key(filePath));
  }

  set(filePath: string, document: T): CachedDocument<T> {
    const entry = { document, loadedAt: Date.now() };
    this.entries.set(this.key(filePath), entry);
    return entry;
  }

  has(filePath: string): boolean {
    return this.entries.has(this.key(filePath));
  }

  invalidate(filePath?: string): boolean {
    if (filePath === undefined) {
      const hadEntries = this.entries.size > 0;
      this.entries.clear();
      return hadEntries;
    }
    return this.entries.delete(this.key(filePath));
  }

  clear(): void {
    this.entries.clear();
  }

  get size(): number {
    return this.entries.size;
  }

  private key(filePath: string): string {
    return path.normalize(path.resolve(filePath));
  }
}

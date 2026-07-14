export class CacheIndex {
  readonly byHash = new Map<string, string>();
  readonly byProvider = new Map<string, Set<string>>();
  readonly byWorkspace = new Map<string, Set<string>>();
  readonly byDocument = new Map<string, Set<string>>();
  readonly byTag = new Map<string, Set<string>>();
  readonly byCapability = new Map<string, Set<string>>();

  index(hash: string, provider: string, workspace: string, documentIds: string[], tags: string[], capability?: string): void {
    this.byHash.set(hash, hash);

    this.addToIndex(this.byProvider, provider, hash);
    this.addToIndex(this.byWorkspace, workspace, hash);

    if (capability) {
      this.addToIndex(this.byCapability, capability, hash);
    }

    for (const docId of documentIds) {
      this.addToIndex(this.byDocument, docId, hash);
    }

    for (const tag of tags) {
      this.addToIndex(this.byTag, tag, hash);
    }
  }

  deindex(hash: string, provider: string, workspace: string, documentIds: string[], tags: string[], capability?: string): void {
    this.byHash.delete(hash);

    this.removeFromIndex(this.byProvider, provider, hash);
    this.removeFromIndex(this.byWorkspace, workspace, hash);

    if (capability) {
      this.removeFromIndex(this.byCapability, capability, hash);
    }

    for (const docId of documentIds) {
      this.removeFromIndex(this.byDocument, docId, hash);
    }

    for (const tag of tags) {
      this.removeFromIndex(this.byTag, tag, hash);
    }
  }

  clear(): void {
    this.byHash.clear();
    this.byProvider.clear();
    this.byWorkspace.clear();
    this.byDocument.clear();
    this.byTag.clear();
    this.byCapability.clear();
  }

  private addToIndex(map: Map<string, Set<string>>, key: string, hash: string): void {
    const k = key.toLowerCase();
    let set = map.get(k);
    if (!set) {
      set = new Set<string>();
      map.set(k, set);
    }
    set.add(hash);
  }

  private removeFromIndex(map: Map<string, Set<string>>, key: string, hash: string): void {
    const k = key.toLowerCase();
    const set = map.get(k);
    if (set) {
      set.delete(hash);
      if (set.size === 0) {
        map.delete(k);
      }
    }
  }
}

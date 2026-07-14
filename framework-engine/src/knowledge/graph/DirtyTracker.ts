export class DirtyTracker {
  private readonly dirtyFiles = new Set<string>();

  mark(filePath: string): void {
    this.dirtyFiles.add(filePath);
  }

  clear(filePath: string): boolean {
    return this.dirtyFiles.delete(filePath);
  }

  clearAll(): void {
    this.dirtyFiles.clear();
  }

  isDirty(): boolean {
    return this.dirtyFiles.size > 0;
  }

  getDirtyFiles(): string[] {
    return Array.from(this.dirtyFiles);
  }
}

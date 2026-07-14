export interface DirtyFileRecord {
  path: string;
  timestamp: number;
  reason: string;
}

export class DirtyChecker {
  private readonly changedFiles = new Map<string, DirtyFileRecord>();
  private currentBatchId = 0;

  recordChange(path: string, reason = 'file_modified'): void {
    this.changedFiles.set(path, {
      path,
      timestamp: Date.now(),
      reason,
    });
  }

  isDirty(): boolean {
    return this.changedFiles.size > 0;
  }

  getDirtyCount(): number {
    return this.changedFiles.size;
  }

  getChanges(): DirtyFileRecord[] {
    return Array.from(this.changedFiles.values());
  }

  createBatch(): { id: number; files: string[] } {
    this.currentBatchId++;
    return {
      id: this.currentBatchId,
      files: Array.from(this.changedFiles.keys()),
    };
  }

  clearChanges(files: string[]): void {
    for (const file of files) {
      this.changedFiles.delete(file);
    }
  }

  clearAll(): void {
    this.changedFiles.clear();
  }
}

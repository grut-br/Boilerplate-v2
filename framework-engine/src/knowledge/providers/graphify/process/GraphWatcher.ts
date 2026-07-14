import * as fs from 'node:fs';
import * as path from 'node:path';

export interface GraphWatcher {
  start(): void;
  stop(): void;
  onEvent(callback: (filePath: string) => void): void;
}

export class RealGraphWatcher implements GraphWatcher {
  private callback?: (filePath: string) => void;
  private watcher: fs.FSWatcher | null = null;
  private readonly targetDir: string;

  constructor(targetDir: string) {
    this.targetDir = targetDir;
  }

  start(): void {
    if (this.watcher) return;
    if (!fs.existsSync(this.targetDir)) return;

    try {
      this.watcher = fs.watch(this.targetDir, { recursive: true }, (eventType, filename) => {
        if (filename && this.callback) {
          const fullPath = path.resolve(path.join(this.targetDir, filename));
          if (!filename.includes('graph.json') && !filename.includes('.git') && !filename.includes('node_modules')) {
            this.callback(fullPath);
          }
        }
      });
    } catch {
      // Fallback
    }
  }

  stop(): void {
    if (this.watcher) {
      this.watcher.close();
      this.watcher = null;
    }
  }

  onEvent(callback: (filePath: string) => void): void {
    this.callback = callback;
  }
}

export class MockGraphWatcher implements GraphWatcher {
  private callback?: (filePath: string) => void;
  private active = false;

  start(): void {
    this.active = true;
  }

  stop(): void {
    this.active = false;
  }

  onEvent(callback: (filePath: string) => void): void {
    this.callback = callback;
  }

  simulateFileChange(filePath: string): void {
    if (this.active && this.callback) {
      this.callback(filePath);
    }
  }
}

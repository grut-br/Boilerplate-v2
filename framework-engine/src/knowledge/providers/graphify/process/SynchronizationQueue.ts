export interface QueueItem {
  id: string;
  priority: number;
  timestamp: number;
}

export class SynchronizationQueue {
  private queue: QueueItem[] = [];
  private readonly maxLimit = 1000;

  push(filePath: string, priority = 0): void {
    const existingIndex = this.queue.findIndex(item => item.id === filePath);
    if (existingIndex !== -1) {
      const existing = this.queue[existingIndex];
      existing.priority = Math.max(existing.priority, priority);
      existing.timestamp = Date.now();
      return;
    }

    if (this.queue.length >= this.maxLimit) {
      throw new Error('Queue Overflow');
    }

    this.queue.push({
      id: filePath,
      priority,
      timestamp: Date.now(),
    });

    this.sortQueue();
  }

  cancel(filePath: string): boolean {
    const lenBefore = this.queue.length;
    this.queue = this.queue.filter(item => item.id !== filePath);
    return this.queue.length < lenBefore;
  }

  pop(): QueueItem | undefined {
    return this.queue.shift();
  }

  popAll(): QueueItem[] {
    const items = [...this.queue];
    this.queue = [];
    return items;
  }

  getItems(): QueueItem[] {
    return [...this.queue];
  }

  isEmpty(): boolean {
    return this.queue.length === 0;
  }

  size(): number {
    return this.queue.length;
  }

  clear(): void {
    this.queue = [];
  }

  private sortQueue(): void {
    this.queue.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return a.timestamp - b.timestamp;
    });
  }
}

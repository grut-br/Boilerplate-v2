export class KnowledgePriority {
  private readonly priorities = new Map<string, number>();

  constructor() {
    this.priorities.set('markdown', 1);
  }

  setPriority(providerId: string, priority: number): this {
    this.priorities.set(providerId, priority);
    return this;
  }

  getPriority(providerId: string): number {
    return this.priorities.get(providerId) ?? 0;
  }

  sort<T>(items: T[], getProviderId: (item: T) => string): T[] {
    return [...items].sort((a, b) => {
      const pA = this.getPriority(getProviderId(a));
      const pB = this.getPriority(getProviderId(b));
      return pB - pA;
    });
  }
}

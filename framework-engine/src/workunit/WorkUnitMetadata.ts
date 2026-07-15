export interface WorkUnitMetadataInput {
  version?: string;
  date?: string;
  author?: string;
  tags?: string[];
  priority?: string;
  category?: string;
}

export class WorkUnitMetadata {
  readonly version: string;
  readonly date: string;
  readonly author: string;
  readonly tags: string[];
  readonly priority: string;
  readonly category: string;

  constructor(input: WorkUnitMetadataInput = {}) {
    this.version = input.version ?? '1.0';
    this.date = input.date ?? new Date().toISOString();
    this.author = input.author ?? 'unknown';
    this.tags = [...(input.tags ?? [])];
    this.priority = input.priority ?? 'normal';
    this.category = input.category ?? 'general';
  }

  toJSON(): WorkUnitMetadataInput {
    return {
      version: this.version,
      date: this.date,
      author: this.author,
      tags: [...this.tags],
      priority: this.priority,
      category: this.category,
    };
  }
}

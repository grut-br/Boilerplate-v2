export const WorkUnitField = {
  Id: 'id',
  Title: 'title',
  Description: 'description',
  Objective: 'objective',
  Capability: 'capability',
  Workflow: 'workflow',
  Priority: 'priority',
  Tags: 'tags',
  Status: 'status',
  Author: 'author',
  CreatedAt: 'createdAt',
} as const;

export type WorkUnitField = (typeof WorkUnitField)[keyof typeof WorkUnitField];

export class WorkUnitSchema {
  static readonly requiredFields = [
    WorkUnitField.Id,
    WorkUnitField.Capability,
    WorkUnitField.Workflow,
    WorkUnitField.Objective,
  ] as const;

  static readonly metadataFields = ['version', 'date', 'author', 'tags', 'priority', 'category'] as const;

  static readonly sections = ['Instructions', 'References', 'Checklist'] as const;

  static isIdentifier(value: string): boolean {
    return /^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(value);
  }

  static isPresent(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }
}

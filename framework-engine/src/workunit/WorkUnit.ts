import type { WorkUnitMetadata } from './WorkUnitMetadata.ts';

export interface WorkUnit {
  id: string;
  title: string;
  description: string;
  objective: string;
  capability: string;
  workflow: string;
  priority: string;
  tags: string[];
  status: string;
  author: string;
  createdAt: string;
  rawContent: string;
  metadata: WorkUnitMetadata;
  body: string;
  instructions: string;
  references: string[];
  checklist: string[];
}

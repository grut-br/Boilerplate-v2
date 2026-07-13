import type { MarkdownDocument } from '../loader/MarkdownParser.ts';

export type ContextDocumentKind =
  | 'capability'
  | 'rule'
  | 'specification'
  | 'workflow'
  | 'template'
  | 'adr'
  | 'knowledge';

export interface WorkUnitDocument {
  name: string;
  priority?: number;
  required?: boolean;
}

export interface WorkUnit {
  id: string;
  capability: string;
  task?: string;
  systemPrompt?: string;
  rules?: Array<string | WorkUnitDocument>;
  specifications?: Array<string | WorkUnitDocument>;
  workflows?: Array<string | WorkUnitDocument>;
  templates?: Array<string | WorkUnitDocument>;
  adrs?: Array<string | WorkUnitDocument>;
  knowledge?: Array<string | WorkUnitDocument>;
}

export interface CapabilityDefinition {
  name: string;
  rules?: Array<string | WorkUnitDocument>;
  specifications?: Array<string | WorkUnitDocument>;
  workflows?: Array<string | WorkUnitDocument>;
  templates?: Array<string | WorkUnitDocument>;
  adrs?: Array<string | WorkUnitDocument>;
  knowledge?: Array<string | WorkUnitDocument>;
}

export interface ContextDocumentRequest {
  kind: ContextDocumentKind;
  name: string;
  priority: number;
  required: boolean;
}

export interface ResolvedContextDocument extends ContextDocumentRequest {
  path: string;
  document?: MarkdownDocument;
}

export interface HydratedDocument extends ResolvedContextDocument {
  document: MarkdownDocument;
  estimatedTokens: number;
}

export interface ContextBudgetStats {
  maxTokens: number;
  usedTokens: number;
  discardedTokens: number;
  loadedDocuments: number;
  discardedDocuments: number;
  requiredDocuments: number;
  optionalDocuments: number;
}

export interface ContextSnapshot {
  loadedFiles: string[];
  discardedFiles: string[];
  estimatedTokens: number;
  budgetUsed: number;
  capability: string;
  hydrationTimeMs: number;
  warnings: string[];
  statistics: ContextBudgetStats;
}

export interface PromptSections {
  systemPrompt: string;
  capabilityPrompt: string;
  rules: string;
  knowledge: string;
  specification: string;
  task: string;
  workflows: string;
  templates: string;
  adrs: string;
  finalPayload: string;
}

export interface HydratedContext {
  sections: PromptSections;
  documents: HydratedDocument[];
  snapshot: ContextSnapshot;
}

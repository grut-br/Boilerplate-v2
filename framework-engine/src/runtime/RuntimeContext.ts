import { RuntimeConfiguration } from './RuntimeConfiguration.ts';
import { RuntimeMetrics } from './RuntimeMetrics.ts';
import type { WorkUnit } from '../workunit/WorkUnit.ts';
import type { KnowledgeRequest } from '../knowledge/contracts/KnowledgeRequest.ts';
import type { KnowledgeResult } from '../knowledge/contracts/KnowledgeResult.ts';
import type { PromptAssemblyRequest } from './assembly/PromptRuntimeMapper.ts';
import type { PromptAssemblyResult } from '../prompt/PromptAssembler.ts';
import type { ProviderResult } from '../providers/runtime/ProviderResponse.ts';

export const RuntimeState = {
  Uninitialized: 'Uninitialized',
  Initialized: 'Initialized',
  Loading: 'Loading',
  Executing: 'Executing',
  Completed: 'Completed',
  Failed: 'Failed',
} as const;

export type RuntimeState = (typeof RuntimeState)[keyof typeof RuntimeState];

export interface RuntimeContextInput {
  executionId: string;
  workspace: string;
  timestamp?: number;
  runtimeState?: RuntimeState;
  configuration?: RuntimeConfiguration;
  metrics?: RuntimeMetrics;
}

export class RuntimeContext {
  readonly executionId: string;
  readonly workspace: string;
  readonly timestamp: number;
  runtimeState: RuntimeState;
  readonly configuration: RuntimeConfiguration;
  readonly metrics: RuntimeMetrics;
  currentWorkUnit?: WorkUnit;
  knowledgeRequest?: KnowledgeRequest;
  knowledgeResult?: KnowledgeResult;
  promptRequest?: PromptAssemblyRequest;
  promptResult?: PromptAssemblyResult;
  executionResult?: ProviderResult;

  constructor(input: RuntimeContextInput) {
    this.executionId = input.executionId;
    this.workspace = input.workspace;
    this.timestamp = input.timestamp ?? Date.now();
    this.runtimeState = input.runtimeState ?? RuntimeState.Uninitialized;
    this.configuration = input.configuration ?? new RuntimeConfiguration();
    this.metrics = input.metrics ?? new RuntimeMetrics();
  }

  toJSON() {
    return {
      executionId: this.executionId,
      workspace: this.workspace,
      timestamp: this.timestamp,
      runtimeState: this.runtimeState,
      configuration: this.configuration.toJSON(),
      metrics: this.metrics.toJSON(),
      currentWorkUnit: this.currentWorkUnit,
      knowledgeRequest: this.knowledgeRequest,
      knowledgeResult: this.knowledgeResult,
      promptRequest: this.promptRequest,
      promptResult: this.promptResult,
      executionResult: this.executionResult,
    };
  }
}

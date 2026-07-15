import type { RuntimeConfigurationInput } from './RuntimeConfiguration.ts';
import type { RuntimeMetricsSnapshot } from './RuntimeMetrics.ts';
import type { RuntimeStageName } from './RuntimePipeline.ts';
import type { RuntimeState } from './RuntimeContext.ts';
import type { WorkUnit } from '../workunit/WorkUnit.ts';

export interface KnowledgeSnapshot {
  request: {
    query: string;
    workspace: string;
    capability?: string;
    filters?: Record<string, any>;
    metadata?: any;
  };
  responseMetadata?: any;
  providerName?: string;
  duration?: number;
}

export interface RuntimePromptSnapshot {
  size: number;
  documentsCount: number;
  capabilitiesCount: number;
  workflowsCount: number;
  duration: number;
}

export interface RuntimeAIExecutionSnapshot {
  success: boolean;
  provider: string;
  duration: number;
  tokensPrompt: number;
  tokensCompletion: number;
  content?: string;
}

export interface RuntimeSnapshot {
  executionId: string;
  runtimeState: RuntimeState;
  configuration: RuntimeConfigurationInput;
  metrics: RuntimeMetricsSnapshot;
  pipeline: RuntimeStageName[];
  loadedWorkUnit?: WorkUnit;
  knowledge?: KnowledgeSnapshot;
  prompt?: RuntimePromptSnapshot;
  execution?: RuntimeAIExecutionSnapshot;
}

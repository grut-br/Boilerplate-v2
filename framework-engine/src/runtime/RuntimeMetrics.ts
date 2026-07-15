export const RuntimeExecutionStatus = {
  Idle: 'idle',
  Running: 'running',
  Completed: 'completed',
  Failed: 'failed',
} as const;

export type RuntimeExecutionStatus =
  (typeof RuntimeExecutionStatus)[keyof typeof RuntimeExecutionStatus];

export interface RuntimeMetricsSnapshot {
  startTime?: number;
  finishTime?: number;
  duration?: number;
  currentStage?: string;
  executionStatus: RuntimeExecutionStatus;
  readTime?: number;
  parsingTime?: number;
  validationTime?: number;
  knowledgeDuration?: number;
  providerName?: string;
  documentsResolved?: number;
  nodesResolved?: number;
  assemblyDuration?: number;
  promptSize?: number;
  documentsInjected?: number;
  capabilitiesInjected?: number;
  workflowsInjected?: number;
  executionDuration?: number;
  tokensPrompt?: number;
  tokensCompletion?: number;
}

export class RuntimeMetrics {
  startTime?: number;
  finishTime?: number;
  duration?: number;
  currentStage?: string;
  executionStatus: RuntimeExecutionStatus = RuntimeExecutionStatus.Idle;
  readTime?: number;
  parsingTime?: number;
  validationTime?: number;
  knowledgeDuration?: number;
  providerName?: string;
  documentsResolved?: number;
  nodesResolved?: number;
  assemblyDuration?: number;
  promptSize?: number;
  documentsInjected?: number;
  capabilitiesInjected?: number;
  workflowsInjected?: number;
  executionDuration?: number;
  tokensPrompt?: number;
  tokensCompletion?: number;

  recordReadTime(duration: number): void {
    this.readTime = duration;
  }

  recordParsingTime(duration: number): void {
    this.parsingTime = duration;
  }

  recordValidationTime(duration: number): void {
    this.validationTime = duration;
  }

  recordKnowledge(duration: number, providerName: string, docsCount: number, nodesCount: number): void {
    this.knowledgeDuration = duration;
    this.providerName = providerName;
    this.documentsResolved = docsCount;
    this.nodesResolved = nodesCount;
  }

  recordAssembly(duration: number, size: number, docsCount: number, capsCount: number, workflowsCount: number): void {
    this.assemblyDuration = duration;
    this.promptSize = size;
    this.documentsInjected = docsCount;
    this.capabilitiesInjected = capsCount;
    this.workflowsInjected = workflowsCount;
  }

  recordExecution(duration: number, providerName: string, promptTokens: number, completionTokens: number): void {
    this.executionDuration = duration;
    this.providerName = providerName;
    this.tokensPrompt = promptTokens;
    this.tokensCompletion = completionTokens;
  }

  start(timestamp = Date.now()): void {
    this.startTime = timestamp;
    this.finishTime = undefined;
    this.duration = undefined;
    this.executionStatus = RuntimeExecutionStatus.Running;
  }

  setStage(stage: string): void {
    this.currentStage = stage;
  }

  finish(timestamp = Date.now()): void {
    this.finishTime = timestamp;
    this.duration = this.startTime === undefined ? undefined : timestamp - this.startTime;
    this.executionStatus = RuntimeExecutionStatus.Completed;
  }

  fail(timestamp = Date.now()): void {
    this.finishTime = timestamp;
    this.duration = this.startTime === undefined ? undefined : timestamp - this.startTime;
    this.executionStatus = RuntimeExecutionStatus.Failed;
  }

  toJSON(): RuntimeMetricsSnapshot {
    const snapshot: RuntimeMetricsSnapshot = {
      startTime: this.startTime,
      finishTime: this.finishTime,
      duration: this.duration,
      currentStage: this.currentStage,
      executionStatus: this.executionStatus,
    };

    if (this.readTime !== undefined) snapshot.readTime = this.readTime;
    if (this.parsingTime !== undefined) snapshot.parsingTime = this.parsingTime;
    if (this.validationTime !== undefined) snapshot.validationTime = this.validationTime;
    if (this.knowledgeDuration !== undefined) snapshot.knowledgeDuration = this.knowledgeDuration;
    if (this.providerName !== undefined) snapshot.providerName = this.providerName;
    if (this.documentsResolved !== undefined) snapshot.documentsResolved = this.documentsResolved;
    if (this.nodesResolved !== undefined) snapshot.nodesResolved = this.nodesResolved;
    if (this.assemblyDuration !== undefined) snapshot.assemblyDuration = this.assemblyDuration;
    if (this.promptSize !== undefined) snapshot.promptSize = this.promptSize;
    if (this.documentsInjected !== undefined) snapshot.documentsInjected = this.documentsInjected;
    if (this.capabilitiesInjected !== undefined) snapshot.capabilitiesInjected = this.capabilitiesInjected;
    if (this.workflowsInjected !== undefined) snapshot.workflowsInjected = this.workflowsInjected;
    if (this.executionDuration !== undefined) snapshot.executionDuration = this.executionDuration;
    if (this.tokensPrompt !== undefined) snapshot.tokensPrompt = this.tokensPrompt;
    if (this.tokensCompletion !== undefined) snapshot.tokensCompletion = this.tokensCompletion;
    return snapshot;
  }
}

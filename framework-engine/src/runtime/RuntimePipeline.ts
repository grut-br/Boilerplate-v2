export const RuntimeStageName = {
  LoadWorkUnit: 'LoadWorkUnit',
  ResolveCapability: 'ResolveCapability',
  ResolveWorkflow: 'ResolveWorkflow',
  KnowledgeResolution: 'KnowledgeResolution',
  PromptAssembly: 'PromptAssembly',
  Execution: 'Execution',
  Finalize: 'Finalize',
} as const;

export type RuntimeStageName = (typeof RuntimeStageName)[keyof typeof RuntimeStageName];

export class RuntimePipeline {
  readonly stages: readonly RuntimeStageName[] = [
    RuntimeStageName.LoadWorkUnit,
    RuntimeStageName.ResolveCapability,
    RuntimeStageName.ResolveWorkflow,
    RuntimeStageName.KnowledgeResolution,
    RuntimeStageName.PromptAssembly,
    RuntimeStageName.Execution,
    RuntimeStageName.Finalize,
  ];

  toJSON(): RuntimeStageName[] {
    return [...this.stages];
  }
}

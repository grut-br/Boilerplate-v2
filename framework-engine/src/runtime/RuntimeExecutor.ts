import { InvalidRuntimeState, RuntimeAlreadyInitialized, RuntimeNotInitialized } from './RuntimeErrors.ts';
import { RuntimeConfiguration, type RuntimeConfigurationInput } from './RuntimeConfiguration.ts';
import { RuntimeContext, RuntimeState } from './RuntimeContext.ts';
import { RuntimeMetrics } from './RuntimeMetrics.ts';
import { RuntimePipeline } from './RuntimePipeline.ts';
import type { RuntimeSnapshot } from './RuntimeSnapshot.ts';
import { WorkUnitLoader, WorkUnitParser, WorkUnitValidator } from '../workunit/index.ts';
import type { WorkUnit } from '../workunit/WorkUnit.ts';
import type { KnowledgeEngine } from '../knowledge/KnowledgeEngine.ts';
import { KnowledgeRuntimeBridge } from './integration/KnowledgeRuntimeBridge.ts';
import type { PromptAssembler } from '../prompt/PromptAssembler.ts';
import { PromptRuntimeBridge } from './assembly/PromptRuntimeBridge.ts';
import type { ProviderExecutor } from '../providers/runtime/ProviderExecutor.ts';
import { ExecutionRuntimeBridge } from './execution/ExecutionRuntimeBridge.ts';

let executionSequence = 0;

export class RuntimeExecutor {
  private context?: RuntimeContext;
  private readonly pipeline = new RuntimePipeline();
  private readonly workUnitLoader = new WorkUnitLoader();
  private readonly workUnitParser = new WorkUnitParser();
  private readonly workUnitValidator = new WorkUnitValidator();
  private readonly engine?: KnowledgeEngine;
  private readonly bridge?: KnowledgeRuntimeBridge;
  private readonly assembler?: PromptAssembler;
  private readonly promptBridge?: PromptRuntimeBridge;
  private readonly providerExecutor?: ProviderExecutor;
  private readonly executionBridge?: ExecutionRuntimeBridge;

  constructor(
    engine?: KnowledgeEngine,
    assembler?: PromptAssembler,
    providerExecutor?: ProviderExecutor
  ) {
    this.engine = engine;
    if (engine) {
      this.bridge = new KnowledgeRuntimeBridge(engine);
    }
    this.assembler = assembler;
    if (assembler) {
      this.promptBridge = new PromptRuntimeBridge(assembler);
    }
    this.providerExecutor = providerExecutor;
    if (providerExecutor) {
      this.executionBridge = new ExecutionRuntimeBridge(providerExecutor);
    }
  }

  get state(): RuntimeState {
    return this.context?.runtimeState ?? RuntimeState.Uninitialized;
  }

  get runtimeContext(): RuntimeContext | undefined {
    return this.context;
  }

  get runtimePipeline(): RuntimePipeline {
    return this.pipeline;
  }

  initialize(
    workspaceOrConfiguration: string | RuntimeConfigurationInput | RuntimeConfiguration = '',
    configuration: RuntimeConfigurationInput | RuntimeConfiguration = {},
  ): RuntimeContext {
    if (this.context) throw new RuntimeAlreadyInitialized();

    const workspace = typeof workspaceOrConfiguration === 'string' ? workspaceOrConfiguration : '';
    const configurationInput = typeof workspaceOrConfiguration === 'string'
      ? configuration
      : workspaceOrConfiguration;
    const resolvedConfiguration = configurationInput instanceof RuntimeConfiguration
      ? configurationInput
      : new RuntimeConfiguration(configurationInput);

    this.context = new RuntimeContext({
      executionId: `runtime-${Date.now()}-${++executionSequence}`,
      workspace,
      configuration: resolvedConfiguration,
      metrics: new RuntimeMetrics(),
      runtimeState: RuntimeState.Initialized,
    });

    return this.context;
  }

  execute(): RuntimeSnapshot {
    const context = this.requireContext();
    if (context.runtimeState !== RuntimeState.Initialized) {
      throw new InvalidRuntimeState(`Runtime cannot execute from state ${context.runtimeState}.`);
    }

    context.metrics.start();
    context.runtimeState = RuntimeState.Executing;
    context.metrics.setStage(this.pipeline.stages[this.pipeline.stages.length - 2]);
    context.runtimeState = RuntimeState.Completed;
    context.metrics.setStage(this.pipeline.stages[this.pipeline.stages.length - 1]);
    context.metrics.finish();

    return this.snapshot();
  }

  async loadWorkUnit(filePath: string): Promise<WorkUnit> {
    const context = this.requireContext();
    if (context.runtimeState !== RuntimeState.Initialized) {
      throw new InvalidRuntimeState(`Runtime cannot load a Work Unit from state ${context.runtimeState}.`);
    }

    context.runtimeState = RuntimeState.Loading;
    context.metrics.setStage(this.pipeline.stages[0]);

    try {
      const readStarted = Date.now();
      const rawContent = await this.workUnitLoader.load(filePath);
      context.metrics.recordReadTime(Date.now() - readStarted);

      const parsingStarted = Date.now();
      const parsedWorkUnit = this.workUnitParser.parse(rawContent);
      context.metrics.recordParsingTime(Date.now() - parsingStarted);

      const validationStarted = Date.now();
      const workUnit = this.workUnitValidator.validate(parsedWorkUnit);
      context.metrics.recordValidationTime(Date.now() - validationStarted);

      context.currentWorkUnit = workUnit;

      // Executa a resolução do conhecimento se o bridge estiver ativado
      if (this.bridge) {
        await this.bridge.resolveKnowledge(context);
      }

      // Executa a montagem do prompt se o promptBridge estiver ativado
      if (this.promptBridge) {
        this.promptBridge.assemblePrompt(context);
      }

      // Executa a execução do prompt se a ponte de execução estiver ativada
      if (this.executionBridge) {
        await this.executionBridge.executePrompt(context);
      }

      context.runtimeState = RuntimeState.Initialized;
      return workUnit;
    } catch (error) {
      context.runtimeState = RuntimeState.Failed;
      context.metrics.fail();
      throw error;
    }
  }

  snapshot(): RuntimeSnapshot {
    const context = this.requireContext();

    const knowledgeSnapshot = context.knowledgeRequest ? {
      request: {
        query: context.knowledgeRequest.query,
        workspace: context.knowledgeRequest.workspace,
        capability: context.knowledgeRequest.capability,
        filters: context.knowledgeRequest.filters,
        metadata: context.knowledgeRequest.metadata,
      },
      responseMetadata: context.knowledgeResult?.metadata,
      providerName: context.metrics.providerName,
      duration: context.metrics.knowledgeDuration,
    } : undefined;

    const promptSnapshot = context.promptResult ? {
      size: context.metrics.promptSize ?? 0,
      documentsCount: context.metrics.documentsInjected ?? 0,
      capabilitiesCount: context.metrics.capabilitiesInjected ?? 0,
      workflowsCount: context.metrics.workflowsInjected ?? 0,
      duration: context.metrics.assemblyDuration ?? 0,
    } : undefined;

    const executionSnapshot = context.executionResult ? {
      success: context.executionResult.success,
      provider: context.executionResult.provider,
      duration: context.metrics.executionDuration ?? 0,
      tokensPrompt: context.metrics.tokensPrompt ?? 0,
      tokensCompletion: context.metrics.tokensCompletion ?? 0,
      content: context.executionResult.response?.content,
    } : undefined;

    return {
      executionId: context.executionId,
      runtimeState: context.runtimeState,
      configuration: context.configuration.toJSON(),
      metrics: context.metrics.toJSON(),
      pipeline: this.pipeline.toJSON(),
      loadedWorkUnit: context.currentWorkUnit,
      knowledge: knowledgeSnapshot,
      prompt: promptSnapshot,
      execution: executionSnapshot,
    };
  }

  dispose(): void {
    this.context = undefined;
  }

  private requireContext(): RuntimeContext {
    if (!this.context) throw new RuntimeNotInitialized();
    return this.context;
  }
}

import { RuntimeExecutor } from './RuntimeExecutor.ts';
import { RuntimeConfiguration, type RuntimeConfigurationInput } from './RuntimeConfiguration.ts';
import type { RuntimeContext, RuntimeState } from './RuntimeContext.ts';
import type { RuntimePipeline } from './RuntimePipeline.ts';
import type { RuntimeSnapshot } from './RuntimeSnapshot.ts';
import type { WorkUnit } from '../workunit/WorkUnit.ts';

export class Runtime {
  private readonly executor = new RuntimeExecutor();

  get state(): RuntimeState {
    return this.executor.state;
  }

  get context(): RuntimeContext | undefined {
    return this.executor.runtimeContext;
  }

  get pipeline(): RuntimePipeline {
    return this.executor.runtimePipeline;
  }

  initialize(
    workspaceOrConfiguration: string | RuntimeConfigurationInput | RuntimeConfiguration = '',
    configuration: RuntimeConfigurationInput | RuntimeConfiguration = {},
  ): RuntimeContext {
    return this.executor.initialize(workspaceOrConfiguration, configuration);
  }

  execute(): RuntimeSnapshot {
    return this.executor.execute();
  }

  loadWorkUnit(filePath: string): Promise<WorkUnit> {
    return this.executor.loadWorkUnit(filePath);
  }

  snapshot(): RuntimeSnapshot {
    return this.executor.snapshot();
  }

  dispose(): void {
    this.executor.dispose();
  }
}

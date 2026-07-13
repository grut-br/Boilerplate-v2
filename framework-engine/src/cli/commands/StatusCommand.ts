import { BaseCommand } from '../BaseCommand.ts';
import type { EngineStatus } from '../EnginePort.ts';
import type { CommandContext, CommandResult } from '../types.ts';

export class StatusCommand extends BaseCommand<EngineStatus> {
  readonly name = 'status';
  readonly description = 'Show the current Engine status.';

  async execute({ engine }: CommandContext): Promise<CommandResult<EngineStatus>> {
    return {
      command: this.name,
      success: true,
      exitCode: 0,
      message: 'Engine status retrieved.',
      data: await engine.status(),
    };
  }
}

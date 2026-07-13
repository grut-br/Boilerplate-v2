import { BaseCommand } from '../BaseCommand.ts';
import type { EngineVersion } from '../EnginePort.ts';
import type { CommandContext, CommandResult } from '../types.ts';

export class VersionCommand extends BaseCommand<EngineVersion> {
  readonly name = 'version';
  readonly description = 'Show the Engine version and build metadata.';

  async execute({ engine }: CommandContext): Promise<CommandResult<EngineVersion>> {
    return {
      command: this.name,
      success: true,
      exitCode: 0,
      message: 'Engine version retrieved.',
      data: await engine.version(),
    };
  }
}

import { BaseCommand } from '../BaseCommand.ts';
import type { DoctorReport } from '../EnginePort.ts';
import type { CommandContext, CommandResult } from '../types.ts';

export class DoctorCommand extends BaseCommand<DoctorReport> {
  readonly name = 'doctor';
  readonly description = 'Validate the local Framework environment.';

  async execute({ engine }: CommandContext): Promise<CommandResult<DoctorReport>> {
    return {
      command: this.name,
      success: true,
      exitCode: 0,
      message: 'Environment validation completed.',
      data: await engine.doctor(),
    };
  }
}

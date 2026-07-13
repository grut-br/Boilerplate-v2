import { BaseCommand } from '../BaseCommand.ts';
import type { ProviderStatus } from '../EnginePort.ts';
import type { CommandContext, CommandResult } from '../types.ts';

export class ProvidersCommand extends BaseCommand<ProviderStatus[]> {
  readonly name = 'provider';
  readonly description = 'List registered providers.';

  async execute({ engine }: CommandContext): Promise<CommandResult<ProviderStatus[]>> {
    return {
      command: this.name,
      success: true,
      exitCode: 0,
      message: 'Providers retrieved.',
      data: await engine.listProviders(),
    };
  }
}

import { BaseCommand } from '../BaseCommand.ts';
import type { CommandContext, CommandResult } from '../types.ts';

export class WorkspaceCommand extends BaseCommand {
  readonly name = 'workspace';
  readonly description = 'Open a workspace directory.';

  validate({ args }: CommandContext): string[] {
    return args.positionals.length === 1
      ? []
      : ['Usage: framework workspace <path>'];
  }

  async execute({ args, engine }: CommandContext): Promise<CommandResult> {
    return {
      command: this.name,
      success: true,
      exitCode: 0,
      message: 'Workspace opened.',
      data: await engine.openWorkspace(args.positionals[0]!),
    };
  }
}

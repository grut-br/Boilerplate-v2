import type { CommandContext, CommandResult } from './types.ts';

export abstract class BaseCommand<T = unknown> {
  abstract readonly name: string;
  abstract readonly description: string;

  validate(_context: CommandContext): string[] {
    return [];
  }

  abstract execute(context: CommandContext): Promise<CommandResult<T>>;

  help(): string {
    return `framework ${this.name}\n\n${this.description}`;
  }
}

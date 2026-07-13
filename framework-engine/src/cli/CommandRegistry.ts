import type { BaseCommand } from './BaseCommand.ts';
import type { CommandContext } from './types.ts';

export class CommandRegistry {
  private readonly commands = new Map<string, BaseCommand>();

  register(command: BaseCommand): this {
    if (this.commands.has(command.name)) {
      throw new Error(`Command already registered: ${command.name}`);
    }
    this.commands.set(command.name, command);
    return this;
  }

  get(name: string): BaseCommand | undefined {
    return this.commands.get(name);
  }

  registerAlias(alias: string, commandName: string): this {
    const command = this.get(commandName);
    if (!command) {
      throw new Error(`Cannot alias unknown command: ${commandName}`);
    }
    if (this.commands.has(alias)) {
      throw new Error(`Command already registered: ${alias}`);
    }
    this.commands.set(alias, command);
    return this;
  }

  validate(name: string, context: CommandContext): string[] {
    const command = this.get(name);
    return command ? command.validate(context) : [`Unknown command: ${name}`];
  }

  list(): BaseCommand[] {
    return [...this.commands.values()];
  }
}

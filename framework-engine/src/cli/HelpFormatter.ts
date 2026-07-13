import type { BaseCommand } from './BaseCommand.ts';

export class HelpFormatter {
  format(commands: BaseCommand[]): string {
    const entries = commands
      .map((command) => `  ${command.name.padEnd(12)} ${command.description}`)
      .join('\n');
    return `Framework Engine CLI\n\nUsage: framework <command> [options]\n\nCommands:\n${entries}\n\nGlobal options:\n  --help         Show help\n  --json         Emit JSON\n  --quiet        Suppress successful output\n  --verbose      Include diagnostic details`;
  }

  formatCommand(command: BaseCommand): string {
    return `${command.help()}\n\nOptions:\n  --help         Show this help\n  --json         Emit JSON\n  --quiet        Suppress successful output\n  --verbose      Include diagnostic details`;
  }
}

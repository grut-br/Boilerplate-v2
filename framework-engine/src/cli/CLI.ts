import { BaseCommand } from './BaseCommand.ts';
import { CommandRegistry } from './CommandRegistry.ts';
import { DoctorCommand } from './commands/DoctorCommand.ts';
import { ProvidersCommand } from './commands/ProvidersCommand.ts';
import { StatusCommand } from './commands/StatusCommand.ts';
import { VersionCommand } from './commands/VersionCommand.ts';
import { WorkspaceCommand } from './commands/WorkspaceCommand.ts';
import { HelpFormatter } from './HelpFormatter.ts';
import { OutputFormatter } from './OutputFormatter.ts';
import type { EnginePort } from './EnginePort.ts';
import type { CommandResult, OutputOptions, ParsedArguments } from './types.ts';

export function parseArguments(argv: string[]): ParsedArguments {
  const [command, ...tokens] = argv[0]?.startsWith('-') ? [undefined, ...argv] : argv;
  const positionals: string[] = [];
  const options: Record<string, string | boolean> = {};

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index]!;
    if (!token.startsWith('-')) {
      positionals.push(token);
      continue;
    }

    const normalized = token.replace(/^-+/, '');
    const separator = normalized.indexOf('=');
    if (separator >= 0) {
      options[normalized.slice(0, separator)] = normalized.slice(separator + 1);
      continue;
    }

    const next = tokens[index + 1];
    if (next && !next.startsWith('-')) {
      options[normalized] = next;
      index += 1;
    } else {
      options[normalized] = true;
    }
  }

  return { command, positionals, options };
}

export class CLI {
  readonly registry: CommandRegistry;
  private readonly engine: EnginePort;
  private readonly outputFormatter = new OutputFormatter();
  private readonly helpFormatter = new HelpFormatter();

  constructor(engine: EnginePort, registry = new CommandRegistry()) {
    this.engine = engine;
    this.registry = registry;
    if (registry.list().length === 0) {
      registry
        .register(new DoctorCommand())
        .register(new StatusCommand())
        .register(new WorkspaceCommand())
        .register(new ProvidersCommand())
        .register(new VersionCommand());
      registry.registerAlias('providers', 'provider');
    }
  }

  async run(argv: string[]): Promise<CommandResult> {
    const parsed = parseArguments(argv);
    if (!parsed.command) {
      return this.helpResult();
    }

    const command = this.registry.get(parsed.command);
    if (!command) {
      return {
        command: parsed.command,
        success: false,
        exitCode: 1,
        message: `Unknown command: ${parsed.command}`,
        errorCode: 'UNKNOWN_COMMAND',
      };
    }

    if (parsed.options.help) {
      return {
        command: command.name,
        success: true,
        exitCode: 0,
        message: 'Help generated.',
        data: this.helpFormatter.formatCommand(command),
      };
    }

    const errors = this.registry.validate(parsed.command, { args: parsed, engine: this.engine });
    if (errors.length > 0) {
      return {
        command: command.name,
        success: false,
        exitCode: 2,
        message: errors.join('\n'),
        errorCode: 'INVALID_ARGUMENTS',
      };
    }

    try {
      return await command.execute({ args: parsed, engine: this.engine });
    } catch (error) {
      return {
        command: command.name,
        success: false,
        exitCode: 1,
        message: error instanceof Error ? error.message : String(error),
        errorCode: 'ENGINE_ERROR',
      };
    }
  }

  format(result: CommandResult, options: OutputOptions = {}): string {
    return this.outputFormatter.format(result, options);
  }

  runAndFormat(argv: string[]): Promise<string> {
    const options = this.outputOptions(argv);
    return this.run(argv).then((result) => this.format(result, options));
  }

  private helpResult(): CommandResult {
    return {
      command: 'help',
      success: true,
      exitCode: 0,
      message: 'Help generated.',
      data: this.helpFormatter.format(this.registry.list()),
    };
  }

  private outputOptions(argv: string[]): OutputOptions {
    const parsed = parseArguments(argv);
    const format = parsed.options.format;
    return {
      mode: parsed.options.json || format === 'json' ? 'json' : 'pretty',
      quiet: parsed.options.quiet === true,
      verbose: parsed.options.verbose === true,
    };
  }
}

export { CommandRegistry } from './CommandRegistry.ts';
export { BaseCommand } from './BaseCommand.ts';
export type * from './EnginePort.ts';
export type * from './types.ts';

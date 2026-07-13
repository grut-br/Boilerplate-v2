import type { EnginePort } from './EnginePort.ts';

export interface ParsedArguments {
  command?: string;
  positionals: string[];
  options: Record<string, string | boolean>;
}

export interface CommandContext {
  args: ParsedArguments;
  engine: EnginePort;
}

export interface CommandResult<T = unknown> {
  command: string;
  success: boolean;
  exitCode: number;
  message: string;
  data?: T;
  warnings?: string[];
  errorCode?: string;
}

export interface OutputWriter {
  write(value: string): void;
}

export type OutputMode = 'pretty' | 'json';

export interface OutputOptions {
  mode?: OutputMode;
  quiet?: boolean;
  verbose?: boolean;
}

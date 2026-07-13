import { ErrorFormatter } from './ErrorFormatter.ts';
import type { CommandResult, OutputOptions } from './types.ts';

export class OutputFormatter {
  format(result: CommandResult, options: OutputOptions = {}): string {
    if (options.mode === 'json') {
      return JSON.stringify(result, null, options.verbose ? 2 : undefined);
    }

    if (options.quiet && result.success) {
      return '';
    }

    if (!result.success) {
      return new ErrorFormatter().format(result);
    }

    const lines = [`[OK] ${result.command}: ${result.message}`];
    for (const warning of result.warnings ?? []) {
      lines.push(`[WARN] ${warning}`);
    }
    if (result.data !== undefined) {
      lines.push(JSON.stringify(result.data, null, 2));
    }
    if (options.verbose) {
      lines.push(`exitCode: ${result.exitCode}`);
    }
    return lines.join('\n');
  }
}

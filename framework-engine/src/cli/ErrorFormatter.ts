import type { CommandResult } from './types.ts';

export class ErrorFormatter {
  format(result: Pick<CommandResult, 'command' | 'message' | 'exitCode' | 'errorCode'>): string {
    const code = result.errorCode ? ` [${result.errorCode}]` : '';
    return `[ERROR] ${result.command}${code}: ${result.message} (exit ${result.exitCode})`;
  }
}

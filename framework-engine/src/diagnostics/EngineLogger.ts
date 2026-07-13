import { LogLevel, logLevelName, parseLogLevel, type LogLevelName } from './LogLevel.ts';

export interface LogEntry {
  timestamp: string;
  level: LogLevelName;
  message: string;
  context?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export type LogSink = (entry: LogEntry) => void;

export interface EngineLoggerOptions {
  level?: LogLevel | LogLevelName | string;
  sink?: LogSink;
  context?: Record<string, unknown>;
}

export class EngineLogger {
  readonly level: LogLevel;
  private readonly sink: LogSink;
  private readonly context: Record<string, unknown>;

  constructor(options: EngineLoggerOptions = {}) {
    this.level = parseLogLevel(options.level);
    this.sink = options.sink ?? ((entry) => {
      const method = entry.level === 'ERROR' || entry.level === 'WARN' ? 'error' : 'log';
      console[method](`[${entry.level}] ${entry.message}`, entry.data ?? '');
    });
    this.context = { ...options.context };
  }

  trace(message: string, data?: Record<string, unknown>): void {
    this.write(LogLevel.TRACE, message, data);
  }

  debug(message: string, data?: Record<string, unknown>): void {
    this.write(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.write(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.write(LogLevel.WARN, message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.write(LogLevel.ERROR, message, data);
  }

  child(context: Record<string, unknown>): EngineLogger {
    return new EngineLogger({
      level: this.level,
      sink: this.sink,
      context: { ...this.context, ...context },
    });
  }

  private write(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (level < this.level || this.level === LogLevel.SILENT) return;
    this.sink({
      timestamp: new Date().toISOString(),
      level: logLevelName(level),
      message,
      ...(Object.keys(this.context).length > 0 ? { context: { ...this.context } } : {}),
      ...(data ? { data } : {}),
    });
  }
}

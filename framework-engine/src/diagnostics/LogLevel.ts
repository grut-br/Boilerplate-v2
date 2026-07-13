export const LogLevel = {
  TRACE: 10,
  DEBUG: 20,
  INFO: 30,
  WARN: 40,
  ERROR: 50,
  SILENT: 60,
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

export type LogLevelName = keyof typeof LogLevel;

export function parseLogLevel(value: LogLevel | LogLevelName | string | undefined): LogLevel {
  if (typeof value === 'number' && Object.values(LogLevel).includes(value)) return value;
  if (typeof value === 'string') {
    const normalized = value.toUpperCase() as LogLevelName;
    if (normalized in LogLevel) return LogLevel[normalized];
  }
  return LogLevel.INFO;
}

export function logLevelName(level: LogLevel): LogLevelName {
  const entry = Object.entries(LogLevel).find(([, value]) => value === level);
  return (entry?.[0] ?? 'INFO') as LogLevelName;
}

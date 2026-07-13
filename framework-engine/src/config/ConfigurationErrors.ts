export type ConfigurationErrorCode =
  | 'CONFIG_FILE_NOT_FOUND'
  | 'CONFIG_FILE_INVALID'
  | 'INVALID_CONFIGURATION'
  | 'INVALID_ENVIRONMENT_VALUE';

export class ConfigurationError extends Error {
  readonly code: ConfigurationErrorCode;
  readonly details: Record<string, string | number | boolean | undefined>;

  constructor(
    code: ConfigurationErrorCode,
    message: string,
    details: Record<string, string | number | boolean | undefined> = {},
  ) {
    super(message);
    this.name = 'ConfigurationError';
    this.code = code;
    this.details = details;
  }
}

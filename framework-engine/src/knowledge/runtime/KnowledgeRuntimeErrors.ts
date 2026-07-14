export class ProviderAlreadyRegistered extends Error {
  constructor(providerId: string) {
    super(`Provider with ID '${providerId}' is already registered.`);
    this.name = 'ProviderAlreadyRegistered';
  }
}

export class ProviderNotFound extends Error {
  constructor(providerId: string) {
    super(`Provider with ID '${providerId}' not found.`);
    this.name = 'ProviderNotFound';
  }
}

export class ProviderExecutionError extends Error {
  readonly providerId: string;
  readonly cause?: any;

  constructor(providerId: string, message: string, cause?: any) {
    super(`Failed to execute provider '${providerId}': ${message}`);
    this.name = 'ProviderExecutionError';
    this.providerId = providerId;
    this.cause = cause;
  }
}

export class InvalidProviderState extends Error {
  constructor(providerId: string, state: string, message: string) {
    super(`Provider '${providerId}' in invalid state '${state}': ${message}`);
    this.name = 'InvalidProviderState';
  }
}

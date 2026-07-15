export class RuntimeNotInitialized extends Error {
  constructor() {
    super('Runtime is not initialized.');
    this.name = 'RuntimeNotInitialized';
  }
}

export class RuntimeAlreadyInitialized extends Error {
  constructor() {
    super('Runtime is already initialized.');
    this.name = 'RuntimeAlreadyInitialized';
  }
}

export class InvalidRuntimeState extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRuntimeState';
  }
}

export class RuntimeExecutionFailed extends Error {
  constructor(message = 'Runtime execution failed.', options?: ErrorOptions) {
    super(message, options);
    this.name = 'RuntimeExecutionFailed';
  }
}

export class RuntimePipelineError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'RuntimePipelineError';
  }
}

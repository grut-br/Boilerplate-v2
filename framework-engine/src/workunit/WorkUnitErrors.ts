export class InvalidWorkUnit extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidWorkUnit';
  }
}

export class InvalidMetadata extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidMetadata';
  }
}

export class InvalidCapability extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidCapability';
  }
}

export class InvalidWorkflow extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidWorkflow';
  }
}

export class WorkUnitNotFound extends Error {
  constructor(path: string) {
    super(`Work Unit file was not found: ${path}`);
    this.name = 'WorkUnitNotFound';
  }
}

export class WorkUnitParsingError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'WorkUnitParsingError';
  }
}

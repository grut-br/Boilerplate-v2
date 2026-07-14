export class KnowledgeNotInitialized extends Error {
  constructor(message = 'Knowledge Engine is not initialized') {
    super(message);
    this.name = 'KnowledgeNotInitialized';
  }
}

export class ProviderUnavailable extends Error {
  constructor(message = 'No Knowledge Provider is available') {
    super(message);
    this.name = 'ProviderUnavailable';
  }
}

export class InvalidKnowledgeRequest extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidKnowledgeRequest';
  }
}

export class KnowledgeProviderError extends Error {
  readonly providerId: string;
  readonly cause?: any;

  constructor(message: string, providerId: string, cause?: any) {
    super(message);
    this.name = 'KnowledgeProviderError';
    this.providerId = providerId;
    this.cause = cause;
  }
}

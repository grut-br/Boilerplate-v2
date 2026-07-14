export class CompositionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompositionError';
  }
}

export class DuplicateKnowledgeDocument extends Error {
  readonly documentId: string;
  constructor(documentId: string, message = `Duplicate knowledge document detected with ID: ${documentId}`) {
    super(message);
    this.name = 'DuplicateKnowledgeDocument';
    this.documentId = documentId;
  }
}

export class InvalidKnowledgeComposition extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidKnowledgeComposition';
  }
}

export class ProviderConflict extends Error {
  readonly providerId1: string;
  readonly providerId2: string;
  constructor(providerId1: string, providerId2: string, message = `Conflict between provider '${providerId1}' and '${providerId2}'`) {
    super(message);
    this.name = 'ProviderConflict';
    this.providerId1 = providerId1;
    this.providerId2 = providerId2;
  }
}

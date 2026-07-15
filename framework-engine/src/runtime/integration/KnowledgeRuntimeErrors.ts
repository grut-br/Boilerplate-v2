export { InvalidKnowledgeRequest } from '../../knowledge/KnowledgeErrors.ts';

export class KnowledgeResolutionFailed extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'KnowledgeResolutionFailed';
  }
}

export class KnowledgeUnavailable extends Error {
  constructor(message = 'Knowledge Engine is unavailable.', options?: ErrorOptions) {
    super(message, options);
    this.name = 'KnowledgeUnavailable';
  }
}

export class KnowledgeTimeout extends Error {
  constructor(message = 'Knowledge resolution timed out.', options?: ErrorOptions) {
    super(message, options);
    this.name = 'KnowledgeTimeout';
  }
}

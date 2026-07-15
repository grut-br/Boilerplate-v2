export { ProviderUnavailable } from '../../knowledge/KnowledgeErrors.ts';

export class AIExecutionFailed extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'AIExecutionFailed';
  }
}

export class ExecutionTimeout extends Error {
  constructor(message = 'AI execution process timed out.', options?: ErrorOptions) {
    super(message, options);
    this.name = 'ExecutionTimeout';
  }
}

export class KnowledgeResolutionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KnowledgeResolutionError';
  }
}

export class InvalidResolutionStrategy extends Error {
  constructor(strategyName: string) {
    super(`Resolution strategy '${strategyName}' is invalid or not found.`);
    this.name = 'InvalidResolutionStrategy';
  }
}

export class KnowledgeRankingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KnowledgeRankingError';
  }
}

export class KnowledgeFilteringError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'KnowledgeFilteringError';
  }
}

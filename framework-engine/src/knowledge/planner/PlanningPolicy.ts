/**
 * PlanningPolicy
 *
 * Define limites máximos aceitáveis para o plano de consulta gerado pelo Query Planner.
 */

export interface PlanningPolicyOptions {
  maxProviders?: number;
  maxQueries?: number;
  maxDepth?: number;
  maxCost?: number;
  maxEstimatedTokens?: number;
  maxDocuments?: number;
}

export const DEFAULT_PLANNING_POLICY: Required<PlanningPolicyOptions> = {
  maxProviders: 5,
  maxQueries: 10,
  maxDepth: 3,
  maxCost: 100,
  maxEstimatedTokens: 16000,
  maxDocuments: 50,
};

export class PlanningPolicy {
  readonly maxProviders: number;
  readonly maxQueries: number;
  readonly maxDepth: number;
  readonly maxCost: number;
  readonly maxEstimatedTokens: number;
  readonly maxDocuments: number;

  constructor(options: PlanningPolicyOptions = {}) {
    this.maxProviders = options.maxProviders ?? DEFAULT_PLANNING_POLICY.maxProviders;
    this.maxQueries = options.maxQueries ?? DEFAULT_PLANNING_POLICY.maxQueries;
    this.maxDepth = options.maxDepth ?? DEFAULT_PLANNING_POLICY.maxDepth;
    this.maxCost = options.maxCost ?? DEFAULT_PLANNING_POLICY.maxCost;
    this.maxEstimatedTokens = options.maxEstimatedTokens ?? DEFAULT_PLANNING_POLICY.maxEstimatedTokens;
    this.maxDocuments = options.maxDocuments ?? DEFAULT_PLANNING_POLICY.maxDocuments;
  }

  fitsProviders(count: number): boolean {
    return count <= this.maxProviders;
  }

  fitsQueries(count: number): boolean {
    return count <= this.maxQueries;
  }

  fitsDepth(depth: number): boolean {
    return depth <= this.maxDepth;
  }

  fitsCost(cost: number): boolean {
    return cost <= this.maxCost;
  }

  fitsEstimatedTokens(tokens: number): boolean {
    return tokens <= this.maxEstimatedTokens;
  }

  fitsDocuments(count: number): boolean {
    return count <= this.maxDocuments;
  }

  toObject(): Required<PlanningPolicyOptions> {
    return {
      maxProviders: this.maxProviders,
      maxQueries: this.maxQueries,
      maxDepth: this.maxDepth,
      maxCost: this.maxCost,
      maxEstimatedTokens: this.maxEstimatedTokens,
      maxDocuments: this.maxDocuments,
    };
  }
}

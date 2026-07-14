/**
 * PlanningErrors
 *
 * Erros específicos e tipados para a etapa de Planejamento de Consultas (Query Planner).
 * Determinístico - sem dependências de IA.
 */

export class PlanningError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlanningError';
  }
}

export class PlanningPolicyViolation extends PlanningError {
  readonly policy: string;
  readonly actual: number;
  readonly limit: number;

  constructor(policy: string, actual: number, limit: number) {
    super(`Planning policy "${policy}" violated: ${actual} exceeds limit ${limit}`);
    this.name = 'PlanningPolicyViolation';
    this.policy = policy;
    this.actual = actual;
    this.limit = limit;
  }
}

export class PlanningStrategyError extends PlanningError {
  readonly strategyName: string;

  constructor(strategyName: string, message: string) {
    super(`Planning strategy "${strategyName}" failed: ${message}`);
    this.name = 'PlanningStrategyError';
    this.strategyName = strategyName;
  }
}

export class InvalidPlanningInput extends PlanningError {
  constructor(message: string) {
    super(`Invalid planning input: ${message}`);
    this.name = 'InvalidPlanningInput';
  }
}

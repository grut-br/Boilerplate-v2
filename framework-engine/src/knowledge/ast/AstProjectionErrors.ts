/**
 * AstProjectionErrors
 *
 * Erros específicos e tipados para a camada AST Projection Engine.
 * Determinístico - sem dependências de IA.
 */

export class AstProjectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AstProjectionError';
  }
}

export class AstProjectionPolicyViolation extends AstProjectionError {
  readonly policy: string;
  readonly actual: number;
  readonly limit: number;

  constructor(policy: string, actual: number, limit: number) {
    super(`AST Projection policy "${policy}" violated: ${actual} exceeds limit ${limit}`);
    this.name = 'AstProjectionPolicyViolation';
    this.policy = policy;
    this.actual = actual;
    this.limit = limit;
  }
}

export class AstProjectionStrategyError extends AstProjectionError {
  readonly strategyName: string;

  constructor(strategyName: string, message: string) {
    super(`AST Projection strategy "${strategyName}" failed: ${message}`);
    this.name = 'AstProjectionStrategyError';
    this.strategyName = strategyName;
  }
}

export class InvalidAstProjectionInput extends AstProjectionError {
  constructor(message: string) {
    super(`Invalid AST projection input: ${message}`);
    this.name = 'InvalidAstProjectionInput';
  }
}

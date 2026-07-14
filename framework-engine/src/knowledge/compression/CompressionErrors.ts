/**
 * CompressionErrors
 *
 * Erros tipados da Context Compression Engine.
 * Todos determinísticos — sem dependência de IA.
 */

export class CompressionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CompressionError';
  }
}

export class CompressionPolicyViolation extends CompressionError {
  readonly policy: string;
  readonly actual: number;
  readonly limit: number;

  constructor(policy: string, actual: number, limit: number) {
    super(`Compression policy "${policy}" violated: ${actual} exceeds limit ${limit}`);
    this.name = 'CompressionPolicyViolation';
    this.policy = policy;
    this.actual = actual;
    this.limit = limit;
  }
}

export class CompressionPipelineError extends CompressionError {
  readonly stage: string;
  readonly cause?: unknown;

  constructor(stage: string, message: string, cause?: unknown) {
    super(`Compression pipeline failed at stage "${stage}": ${message}`);
    this.name = 'CompressionPipelineError';
    this.stage = stage;
    this.cause = cause;
  }
}

export class InvalidCompressionInput extends CompressionError {
  constructor(message: string) {
    super(`Invalid compression input: ${message}`);
    this.name = 'InvalidCompressionInput';
  }
}

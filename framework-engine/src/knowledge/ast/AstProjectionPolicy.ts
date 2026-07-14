/**
 * AstProjectionPolicy
 *
 * Define limites máximos aceitáveis para a projeção de AST gerada.
 */

export interface AstProjectionPolicyOptions {
  maxNodes?: number;
  maxDepth?: number;
  maxReferences?: number;
  maxFiles?: number;
  maxTokens?: number;
}

export const DEFAULT_AST_PROJECTION_POLICY: Required<AstProjectionPolicyOptions> = {
  maxNodes: 100,
  maxDepth: 5,
  maxReferences: 200,
  maxFiles: 20,
  maxTokens: 8000,
};

export class AstProjectionPolicy {
  readonly maxNodes: number;
  readonly maxDepth: number;
  readonly maxReferences: number;
  readonly maxFiles: number;
  readonly maxTokens: number;

  constructor(options: AstProjectionPolicyOptions = {}) {
    this.maxNodes = options.maxNodes ?? DEFAULT_AST_PROJECTION_POLICY.maxNodes;
    this.maxDepth = options.maxDepth ?? DEFAULT_AST_PROJECTION_POLICY.maxDepth;
    this.maxReferences = options.maxReferences ?? DEFAULT_AST_PROJECTION_POLICY.maxReferences;
    this.maxFiles = options.maxFiles ?? DEFAULT_AST_PROJECTION_POLICY.maxFiles;
    this.maxTokens = options.maxTokens ?? DEFAULT_AST_PROJECTION_POLICY.maxTokens;
  }

  fitsNodes(count: number): boolean {
    return count <= this.maxNodes;
  }

  fitsDepth(depth: number): boolean {
    return depth <= this.maxDepth;
  }

  fitsReferences(count: number): boolean {
    return count <= this.maxReferences;
  }

  fitsFiles(count: number): boolean {
    return count <= this.maxFiles;
  }

  fitsTokens(tokens: number): boolean {
    return tokens <= this.maxTokens;
  }

  toObject(): Required<AstProjectionPolicyOptions> {
    return {
      maxNodes: this.maxNodes,
      maxDepth: this.maxDepth,
      maxReferences: this.maxReferences,
      maxFiles: this.maxFiles,
      maxTokens: this.maxTokens,
    };
  }
}

/**
 * CompressionPolicy
 *
 * Define os limites máximos aceitáveis para o contexto comprimido.
 * Toda compressão é determinística — sem IA, sem sumarização.
 */

export interface CompressionPolicyOptions {
  /** Número máximo de tokens estimados no contexto final */
  maxTokens?: number;

  /** Número máximo de documentos no contexto final */
  maxDocuments?: number;

  /** Número máximo de nodes no contexto final */
  maxNodes?: number;

  /** Número máximo de caracteres totais no contexto final */
  maxCharacters?: number;

  /** Número máximo de seções (headers) por documento */
  maxSections?: number;

  /** Profundidade máxima de headers Markdown permitida (1 = apenas H1) */
  maxDepth?: number;
}

export const DEFAULT_POLICY: Required<CompressionPolicyOptions> = {
  maxTokens: 8000,
  maxDocuments: 20,
  maxNodes: 50,
  maxCharacters: 32000,
  maxSections: 10,
  maxDepth: 3,
};

export class CompressionPolicy {
  readonly maxTokens: number;
  readonly maxDocuments: number;
  readonly maxNodes: number;
  readonly maxCharacters: number;
  readonly maxSections: number;
  readonly maxDepth: number;

  constructor(options: CompressionPolicyOptions = {}) {
    this.maxTokens = options.maxTokens ?? DEFAULT_POLICY.maxTokens;
    this.maxDocuments = options.maxDocuments ?? DEFAULT_POLICY.maxDocuments;
    this.maxNodes = options.maxNodes ?? DEFAULT_POLICY.maxNodes;
    this.maxCharacters = options.maxCharacters ?? DEFAULT_POLICY.maxCharacters;
    this.maxSections = options.maxSections ?? DEFAULT_POLICY.maxSections;
    this.maxDepth = options.maxDepth ?? DEFAULT_POLICY.maxDepth;
  }

  /**
   * Verifica se uma quantidade de tokens está dentro do limite.
   */
  fitsTokens(tokens: number): boolean {
    return tokens <= this.maxTokens;
  }

  /**
   * Verifica se uma quantidade de documentos está dentro do limite.
   */
  fitsDocuments(count: number): boolean {
    return count <= this.maxDocuments;
  }

  /**
   * Verifica se uma quantidade de nodes está dentro do limite.
   */
  fitsNodes(count: number): boolean {
    return count <= this.maxNodes;
  }

  /**
   * Verifica se uma quantidade de caracteres está dentro do limite.
   */
  fitsCharacters(count: number): boolean {
    return count <= this.maxCharacters;
  }

  /**
   * Verifica se um número de seções está dentro do limite.
   */
  fitsSections(count: number): boolean {
    return count <= this.maxSections;
  }

  /**
   * Verifica se uma profundidade de header está dentro do limite.
   */
  fitsDepth(depth: number): boolean {
    return depth <= this.maxDepth;
  }

  /**
   * Serializa a política como objeto plain.
   */
  toObject(): Required<CompressionPolicyOptions> {
    return {
      maxTokens: this.maxTokens,
      maxDocuments: this.maxDocuments,
      maxNodes: this.maxNodes,
      maxCharacters: this.maxCharacters,
      maxSections: this.maxSections,
      maxDepth: this.maxDepth,
    };
  }
}

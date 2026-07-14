/**
 * PromptSection
 *
 * Representa uma seção conceitual individual do prompt.
 */

export interface PromptSectionOptions {
  name: string;
  content: string;
  priority?: number;
  isMandatory?: boolean;
}

export class PromptSection {
  readonly name: string;
  content: string;
  readonly priority: number;
  readonly isMandatory: boolean;

  constructor(options: PromptSectionOptions) {
    this.name = options.name;
    this.content = options.content;
    this.priority = options.priority ?? 0;
    this.isMandatory = options.isMandatory ?? false;
  }

  /**
   * Estima deterministicamente a quantidade de tokens consumidos pela seção.
   * Heurística: caracteres / 4.
   */
  estimateTokens(): number {
    return Math.ceil(this.content.length / 4);
  }

  /**
   * Renderiza a seção formatada como texto markdown.
   */
  render(): string {
    if (!this.content.trim()) return '';
    return `## ${this.name}\n\n${this.content.trim()}\n\n`;
  }
}

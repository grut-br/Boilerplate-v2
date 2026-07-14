/**
 * PromptErrors
 *
 * Erros específicos e tipados para a camada Prompt Assembly V2.
 * Determinístico - sem dependências de IA.
 */

export class PromptAssemblyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PromptAssemblyError';
  }
}

export class PromptBudgetExceeded extends PromptAssemblyError {
  readonly requiredTokens: number;
  readonly budgetLimit: number;

  constructor(requiredTokens: number, budgetLimit: number) {
    super(`Prompt budget exceeded: Required ${requiredTokens} tokens, but limit is ${budgetLimit}`);
    this.name = 'PromptBudgetExceeded';
    this.requiredTokens = requiredTokens;
    this.budgetLimit = budgetLimit;
  }
}

export class MandatorySectionMissing extends PromptAssemblyError {
  readonly sectionName: string;

  constructor(sectionName: string) {
    super(`Mandatory prompt section "${sectionName}" is missing from assembly layout`);
    this.name = 'MandatorySectionMissing';
    this.sectionName = sectionName;
  }
}

export class InvalidPromptLayout extends PromptAssemblyError {
  constructor(message: string) {
    super(`Invalid prompt layout configuration: ${message}`);
    this.name = 'InvalidPromptLayout';
  }
}

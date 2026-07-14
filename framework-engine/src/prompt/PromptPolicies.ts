/**
 * PromptPolicies
 *
 * Define regras, prioridades e validações regulatórias para a montagem de prompts.
 */

export interface PromptPoliciesOptions {
  mandatorySections?: string[];
  optionalSections?: string[];
  priorityRules?: Record<string, number>; // Section name -> priority (quanto maior, mais prioritário)
  providerPolicies?: Record<string, any>;
  budgetPolicies?: {
    allowPartialContext?: boolean;
    failOnBudgetExceeded?: boolean;
  };
}

export const DEFAULT_PROMPT_POLICIES: Required<PromptPoliciesOptions> = {
  mandatorySections: ['System', 'Task', 'Rules'],
  optionalSections: ['Architecture', 'Context', 'Knowledge', 'ADR', 'Workflow', 'Templates', 'History', 'Examples', 'Output Format'],
  priorityRules: {
    'System': 100,
    'Rules': 90,
    'Task': 80,
    'Output Format': 70,
    'History': 60,
    'Context': 50,
    'Knowledge': 40,
    'Architecture': 30,
    'ADR': 20,
    'Examples': 15,
    'Workflow': 10,
    'Templates': 5,
  },
  providerPolicies: {},
  budgetPolicies: {
    allowPartialContext: true,
    failOnBudgetExceeded: false,
  },
};

export class PromptPolicies {
  readonly mandatorySections: string[];
  readonly optionalSections: string[];
  readonly priorityRules: Record<string, number>;
  readonly providerPolicies: Record<string, any>;
  readonly budgetPolicies: {
    allowPartialContext: boolean;
    failOnBudgetExceeded: boolean;
  };

  constructor(options: PromptPoliciesOptions = {}) {
    this.mandatorySections = options.mandatorySections ?? DEFAULT_PROMPT_POLICIES.mandatorySections;
    this.optionalSections = options.optionalSections ?? DEFAULT_PROMPT_POLICIES.optionalSections;
    this.priorityRules = options.priorityRules ?? DEFAULT_PROMPT_POLICIES.priorityRules;
    this.providerPolicies = options.providerPolicies ?? DEFAULT_PROMPT_POLICIES.providerPolicies;
    this.budgetPolicies = {
      allowPartialContext: options.budgetPolicies?.allowPartialContext ?? true,
      failOnBudgetExceeded: options.budgetPolicies?.failOnBudgetExceeded ?? false,
    };
  }

  isMandatory(sectionName: string): boolean {
    return this.mandatorySections.includes(sectionName);
  }

  getPriority(sectionName: string): number {
    return this.priorityRules[sectionName] ?? 0;
  }
}

/**
 * PlanningContext
 *
 * Armazena informações contextuais necessárias para o planejamento da consulta.
 */

import { PlanningPolicy } from './PlanningPolicy.ts';

export interface PlanningContextOptions {
  workspace: string;
  capability?: string;
  availableProviders?: string[];
  preferredTypes?: string[];
  preferredTags?: string[];
  policy?: PlanningPolicy;
  metadata?: Record<string, any>;
}

export class PlanningContext {
  readonly workspace: string;
  readonly capability?: string;
  readonly availableProviders: string[];
  readonly preferredTypes: string[];
  readonly preferredTags: string[];
  readonly policy: PlanningPolicy;
  readonly metadata: Record<string, any>;

  constructor(options: PlanningContextOptions) {
    this.workspace = options.workspace;
    this.capability = options.capability;
    this.availableProviders = options.availableProviders ?? [];
    this.preferredTypes = options.preferredTypes ?? [];
    this.preferredTags = options.preferredTags ?? [];
    this.policy = options.policy ?? new PlanningPolicy();
    this.metadata = options.metadata ?? {};
  }
}

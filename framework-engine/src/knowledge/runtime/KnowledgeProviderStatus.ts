export const KnowledgeProviderStatus = {
  Registered: 'Registered',
  Ready: 'Ready',
  Running: 'Running',
  Unavailable: 'Unavailable',
  Failed: 'Failed',
} as const;

export type KnowledgeProviderStatus = typeof KnowledgeProviderStatus[keyof typeof KnowledgeProviderStatus];

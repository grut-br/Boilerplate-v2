export const GraphState = {
  Uninitialized: 'Uninitialized',
  Ready: 'Ready',
  Dirty: 'Dirty',
  SyncPending: 'SyncPending',
  Synchronizing: 'Synchronizing',
  Synchronized: 'Synchronized',
  Failed: 'Failed',
} as const;

export type GraphState = typeof GraphState[keyof typeof GraphState];

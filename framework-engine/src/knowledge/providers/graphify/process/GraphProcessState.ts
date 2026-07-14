export const GraphProcessState = {
  Uninitialized: 'Uninitialized',
  Starting: 'Starting',
  Running: 'Running',
  Synchronizing: 'Synchronizing',
  Dirty: 'Dirty',
  Idle: 'Idle',
  Stopping: 'Stopping',
  Stopped: 'Stopped',
  Failed: 'Failed',
} as const;

export type GraphProcessState = typeof GraphProcessState[keyof typeof GraphProcessState];

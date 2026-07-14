export const GraphProcessEventTypes = {
  StateChanged: 'stateChanged',
  FileModified: 'fileModified',
  SyncStarted: 'syncStarted',
  SyncCompleted: 'syncCompleted',
  SyncFailed: 'syncFailed',
} as const;

export type GraphProcessEventType = typeof GraphProcessEventTypes[keyof typeof GraphProcessEventTypes];

export interface GraphProcessEvent {
  type: GraphProcessEventType;
  timestamp: number;
  data: any;
}

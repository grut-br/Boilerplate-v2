export interface GraphProcessHealth {
  running: boolean;
  dirty: boolean;
  pendingChanges: number;
  lastSync: number;
  syncDuration: number;
  graphVersion: string;
  queuedChanges: number;
  processId: number | null;
}

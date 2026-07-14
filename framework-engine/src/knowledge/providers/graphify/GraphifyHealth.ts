export interface GraphifyHealth {
  configured: boolean;
  enabled: boolean;
  reachable: boolean;
  providerVersion: string;
  transport: string;
  warnings: string[];
  errors: string[];
  processRunning?: boolean;
  dirtyState?: boolean;
  lastSync?: number;
  pendingChanges?: number;
  syncDuration?: number;
  graphVersion?: string;
  queuedChanges?: number;
}

import { GraphState } from './GraphState.ts';

export interface GraphSnapshot {
  version: string;
  timestamp: number;
  dirtyFiles: string[];
  lastSync: number;
  syncCount: number;
  status: GraphState;
}

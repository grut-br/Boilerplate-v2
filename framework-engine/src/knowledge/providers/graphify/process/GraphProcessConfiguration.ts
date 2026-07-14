export interface GraphProcessConfiguration {
  command: string;
  args: string[];
  autoRestart: boolean;
  maxRestarts: number;
  workspaceRoot?: string;
  graphLocation?: string;
  timeout?: number;
}

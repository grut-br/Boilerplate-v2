export interface GraphifyConfiguration {
  enabled: boolean;
  workspaceRoot: string;
  graphLocation: string;
  transport: 'mcp' | 'stdio' | 'ipc' | 'stub';
  timeout?: number;
  maxDepth?: number;
  maxNodes?: number;
  cacheEnabled?: boolean;
}

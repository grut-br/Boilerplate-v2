export interface McpHealth {
  connected: boolean;
  latency: number;
  version: string;
  transport: 'stdio' | 'http' | 'websocket' | 'spawn' | 'stub';
  lastPing: number;
  status: 'active' | 'disconnected' | 'failed' | 'connecting';
  warnings: string[];
}

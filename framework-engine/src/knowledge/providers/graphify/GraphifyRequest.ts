export interface GraphifyRequest {
  query: string;
  workspaceRoot: string;
  depth?: number;
  limit?: number;
  capability?: string;
  filters?: Record<string, any>;
  params?: Record<string, any>;
}

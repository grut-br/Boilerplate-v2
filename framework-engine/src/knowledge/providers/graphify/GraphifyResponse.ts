export interface GraphifyNode {
  id: string;
  type: string;
  properties: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface GraphifyDocument {
  id: string;
  path: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface GraphifyResponse {
  documents: GraphifyDocument[];
  nodes: GraphifyNode[];
  metadata: Record<string, any>;
  diagnostics: Record<string, any>;
  durationMs: number;
}

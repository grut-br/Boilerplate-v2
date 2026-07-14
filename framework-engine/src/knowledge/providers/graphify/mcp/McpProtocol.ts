export const McpProtocol = {
  version: '2024-11-05',
  commands: {
    initialize: 'initialize',
    ping: 'ping',
    query: 'query',
    status: 'status',
  },
  errors: {
    invalidParams: -32602,
    internalError: -32603,
    methodNotFound: -32601,
  }
} as const;

export interface McpHeader {
  jsonrpc: '2.0';
  id?: string | number;
}

export interface McpPayload<Params = any> {
  jsonrpc: '2.0';
  id?: string | number;
  method?: string;
  params?: Params;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

export interface McpHandshakeRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: 'initialize';
  params: {
    protocolVersion: string;
    capabilities: Record<string, any>;
    clientInfo: {
      name: string;
      version: string;
    };
  };
}

export interface McpHandshakeResponse {
  jsonrpc: '2.0';
  id: string | number;
  result: {
    protocolVersion: string;
    capabilities: Record<string, any>;
    serverInfo: {
      name: string;
      version: string;
    };
  };
}

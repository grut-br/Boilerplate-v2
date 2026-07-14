import type { GraphifyRequest } from '../GraphifyRequest.ts';
import type { McpPayload } from './McpProtocol.ts';

export function toMcpRequest(id: string | number, request: GraphifyRequest): McpPayload {
  return {
    jsonrpc: '2.0',
    id,
    method: 'query',
    params: {
      query: request.query,
      workspaceRoot: request.workspaceRoot,
      depth: request.depth,
      limit: request.limit,
      capability: request.capability,
      filters: request.filters,
      params: request.params,
    }
  };
}

import type { GraphifyResponse } from '../GraphifyResponse.ts';
import type { McpPayload } from './McpProtocol.ts';
import { InvalidMcpResponse } from './McpErrors.ts';

export function toGraphifyResponse(payload: McpPayload): GraphifyResponse {
  if (payload.error) {
    throw new InvalidMcpResponse(`MCP Error (${payload.error.code}): ${payload.error.message}`);
  }

  const result = payload.result;
  if (!result || typeof result !== 'object') {
    throw new InvalidMcpResponse('MCP result is empty or not an object.');
  }

  return {
    documents: Array.isArray(result.documents) ? result.documents : [],
    nodes: Array.isArray(result.nodes) ? result.nodes : [],
    metadata: result.metadata ?? {},
    diagnostics: result.diagnostics ?? {},
    durationMs: typeof result.durationMs === 'number' ? result.durationMs : 0,
  };
}

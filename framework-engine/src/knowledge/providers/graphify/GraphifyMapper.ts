import type { KnowledgeRequest } from '../../contracts/KnowledgeRequest.ts';
import type { KnowledgeResult } from '../../contracts/KnowledgeResult.ts';
import type { GraphifyRequest } from './GraphifyRequest.ts';
import type { GraphifyResponse } from './GraphifyResponse.ts';

export class GraphifyMapper {
  toGraphifyRequest(request: KnowledgeRequest, maxDepth = 2, maxNodes = 100): GraphifyRequest {
    return {
      query: request.query,
      workspaceRoot: request.workspace,
      depth: maxDepth,
      limit: maxNodes,
      capability: request.capability,
      filters: request.filters,
      params: request.metadata,
    };
  }

  toKnowledgeResult(response: GraphifyResponse): KnowledgeResult {
    return {
      documents: response.documents.map(doc => ({
        id: doc.id,
        path: doc.path,
        content: doc.content,
        metadata: doc.metadata ?? {},
      })),
      nodes: response.nodes.map(node => ({
        id: node.id,
        type: node.type,
        properties: node.properties,
        metadata: node.metadata ?? {},
      })),
      metadata: response.metadata ?? {},
      diagnostics: response.diagnostics ?? {},
      duration: response.durationMs,
    };
  }
}

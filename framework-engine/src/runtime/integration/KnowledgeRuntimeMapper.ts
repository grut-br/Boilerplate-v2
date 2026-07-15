import type { WorkUnit } from '../../workunit/WorkUnit.ts';
import type { KnowledgeRequest } from '../../knowledge/contracts/KnowledgeRequest.ts';
import { InvalidKnowledgeRequest } from './KnowledgeRuntimeErrors.ts';

export class KnowledgeRuntimeMapper {
  static toRequest(workUnit: WorkUnit, workspace: string): KnowledgeRequest {
    if (!workUnit) {
      throw new InvalidKnowledgeRequest('WorkUnit cannot be null or undefined.');
    }
    if (!workspace) {
      throw new InvalidKnowledgeRequest('Workspace path is required for KnowledgeRequest.');
    }

    return {
      query: workUnit.objective || workUnit.description || workUnit.title || '',
      workspace,
      capability: workUnit.capability,
      filters: {
        workflow: workUnit.workflow,
        priority: workUnit.priority,
        tags: workUnit.tags,
      },
      metadata: {
        ...workUnit.metadata,
        id: workUnit.id,
        objective: workUnit.objective,
        priority: workUnit.priority,
        workflow: workUnit.workflow,
        tags: workUnit.tags,
      }
    };
  }
}

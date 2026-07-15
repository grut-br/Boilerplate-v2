import { PromptSection } from '../../prompt/PromptSection.ts';
import type { RuntimeContext } from '../RuntimeContext.ts';
import { InvalidPromptAssemblyRequest } from './PromptRuntimeErrors.ts';

export interface PromptAssemblyRequest {
  sections: PromptSection[];
  layoutPreset?: string;
}

export class PromptRuntimeMapper {
  static toAssemblyRequest(context: RuntimeContext): PromptAssemblyRequest {
    if (!context) {
      throw new InvalidPromptAssemblyRequest('RuntimeContext cannot be null or undefined.');
    }
    const wu = context.currentWorkUnit;
    if (!wu) {
      throw new InvalidPromptAssemblyRequest('RuntimeContext must contain a loaded WorkUnit to map assembly.');
    }

    const sections: PromptSection[] = [];

    // 1. Seção System
    sections.push(new PromptSection({
      name: 'System',
      content: `System Roles:\nYou are Antigravity, a coding assistant working in workspace ${context.workspace}. Capability: ${wu.capability}. Workflow: ${wu.workflow}.`,
      priority: 30,
      isMandatory: true,
    }));

    // 2. Seção Task (objetivo, instruções)
    sections.push(new PromptSection({
      name: 'Task',
      content: `Objective: ${wu.objective}\nDescription: ${wu.description}\nInstructions: ${wu.instructions}`,
      priority: 25,
      isMandatory: true,
    }));

    // 3. Seção Rules (checklist)
    if (wu.checklist && wu.checklist.length > 0) {
      sections.push(new PromptSection({
        name: 'Rules',
        content: `Checklist Rules:\n${wu.checklist.map(item => `- [ ] ${item}`).join('\n')}`,
        priority: 20,
        isMandatory: false,
      }));
    }

    // 4. Seção Knowledge (documentos e nós)
    if (context.knowledgeResult) {
      const docsContent = context.knowledgeResult.documents
        ?.map(doc => `--- FILE: ${doc.path} ---\n${doc.content}`)
        ?.join('\n\n') ?? '';
      
      const nodesContent = context.knowledgeResult.nodes
        ?.map(node => `Node: ${node.id} (${node.type})`)
        ?.join('\n') ?? '';

      sections.push(new PromptSection({
        name: 'Knowledge',
        content: `Resolved Code Context:\n${docsContent}\n\nResolved AST Nodes:\n${nodesContent}`,
        priority: 15,
        isMandatory: false,
      }));
    }

    // Mapeamento dinâmico de layoutPreset baseado em workflow
    let layoutPreset = 'default';
    if (wu.workflow === 'planning') {
      layoutPreset = 'planning';
    } else if (wu.workflow === 'refactor' || wu.workflow === 'feature') {
      layoutPreset = 'codeGeneration';
    }

    return {
      sections,
      layoutPreset,
    };
  }
}

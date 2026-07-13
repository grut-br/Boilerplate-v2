import type { HydratedDocument, PromptSections, WorkUnit } from './types.ts';

export interface AssembledContext {
  capability: HydratedDocument[];
  rules: HydratedDocument[];
  knowledge: HydratedDocument[];
  specifications: HydratedDocument[];
  workflows: HydratedDocument[];
  templates: HydratedDocument[];
  adrs: HydratedDocument[];
}

export class ContextAssembler {
  assemble(documents: HydratedDocument[]): AssembledContext {
    const result: AssembledContext = {
      capability: [],
      rules: [],
      knowledge: [],
      specifications: [],
      workflows: [],
      templates: [],
      adrs: [],
    };
    const seen = new Set<string>();
    for (const document of documents) {
      if (seen.has(document.path)) {
        continue;
      }
      seen.add(document.path);
      const buckets: Record<HydratedDocument['kind'], keyof AssembledContext> = {
        capability: 'capability',
        rule: 'rules',
        knowledge: 'knowledge',
        specification: 'specifications',
        workflow: 'workflows',
        template: 'templates',
        adr: 'adrs',
      };
      const bucket = buckets[document.kind];
      result[bucket].push(document);
    }
    return result;
  }

  toSections(workUnit: WorkUnit, assembled: AssembledContext): PromptSections {
    const content = (documents: HydratedDocument[]) => documents.map((document) => document.document.content).join('\n\n');
    const systemPrompt = workUnit.systemPrompt ?? 'You are the Framework Engine execution system.';
    const capabilityPrompt = content(assembled.capability);
    const rules = content(assembled.rules);
    const knowledge = content(assembled.knowledge);
    const specification = content(assembled.specifications);
    const task = workUnit.task ?? '';
    const workflows = content(assembled.workflows);
    const templates = content(assembled.templates);
    const adrs = content(assembled.adrs);
    const finalPayload = [
      ['SYSTEM PROMPT', systemPrompt],
      ['CAPABILITY PROMPT', capabilityPrompt],
      ['RULES', rules],
      ['KNOWLEDGE', knowledge],
      ['SPECIFICATION', specification],
      ['WORKFLOWS', workflows],
      ['TEMPLATES', templates],
      ['ADRS', adrs],
      ['TASK', task],
    ].map(([title, value]) => `## ${title}\n${value}`).join('\n\n');
    return { systemPrompt, capabilityPrompt, rules, knowledge, specification, workflows, templates, adrs, task, finalPayload };
  }
}

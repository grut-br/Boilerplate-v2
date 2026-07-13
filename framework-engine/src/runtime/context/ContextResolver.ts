import path from 'node:path';
import type { MarkdownLoader } from '../loader/MarkdownLoader.ts';
import { HydrationError } from './HydrationErrors.ts';
import type {
  CapabilityDefinition,
  ContextDocumentKind,
  ContextDocumentRequest,
  WorkUnit,
  WorkUnitDocument,
} from './types.ts';

export interface CapabilityRegistry {
  get(name: string): CapabilityDefinition | undefined;
}

export class InMemoryCapabilityRegistry implements CapabilityRegistry {
  private readonly definitions = new Map<string, CapabilityDefinition>();

  register(definition: CapabilityDefinition): this {
    this.definitions.set(definition.name, definition);
    return this;
  }

  get(name: string): CapabilityDefinition | undefined {
    return this.definitions.get(name);
  }
}

export class ContextResolver {
  private readonly loader: MarkdownLoader;
  private readonly registry: CapabilityRegistry;

  constructor(loader: MarkdownLoader, registry: CapabilityRegistry) {
    this.loader = loader;
    this.registry = registry;
  }

  resolve(workUnit: WorkUnit): ContextDocumentRequest[] {
    if (!workUnit.id || !workUnit.capability) {
      throw new HydrationError('INVALID_WORK_UNIT', 'A Work Unit requires an id and capability.');
    }

    const capability = this.registry.get(workUnit.capability);
    if (!capability) {
      throw new HydrationError(
        'CAPABILITY_NOT_REGISTERED',
        `Capability is not registered: ${workUnit.capability}`,
        { capability: workUnit.capability },
      );
    }

    const requests: ContextDocumentRequest[] = [
      { kind: 'capability', name: capability.name, priority: 1000, required: true },
    ];
    const fields: Array<{
      kind: Exclude<ContextDocumentKind, 'capability'>;
      values?: Array<string | WorkUnitDocument>;
      registryValues?: Array<string | WorkUnitDocument>;
      defaultPriority: number;
    }> = [
      { kind: 'rule', values: workUnit.rules, registryValues: capability.rules, defaultPriority: 900 },
      { kind: 'specification', values: workUnit.specifications, registryValues: capability.specifications, defaultPriority: 700 },
      { kind: 'workflow', values: workUnit.workflows, registryValues: capability.workflows, defaultPriority: 600 },
      { kind: 'template', values: workUnit.templates, registryValues: capability.templates, defaultPriority: 500 },
      { kind: 'adr', values: workUnit.adrs, registryValues: capability.adrs, defaultPriority: 400 },
      { kind: 'knowledge', values: workUnit.knowledge, registryValues: capability.knowledge, defaultPriority: 300 },
    ];

    for (const field of fields) {
      for (const value of [...(field.registryValues ?? []), ...(field.values ?? [])]) {
        const item = typeof value === 'string' ? { name: value } : value;
        requests.push({
          kind: field.kind,
          name: this.normalizeName(item.name),
          priority: item.priority ?? field.defaultPriority,
          required: item.required ?? false,
        });
      }
    }

    return this.deduplicate(requests);
  }

  resolvePath(request: ContextDocumentRequest): string {
    if (request.kind === 'capability') {
      return this.loader.directories.agents
        ? path.join(this.loader.directories.agents, 'capabilities', `${request.name}.md`)
        : request.name;
    }

    const directory = request.kind === 'rule'
      ? path.join(this.loader.directories.agents, 'rules')
      : request.kind === 'workflow'
        ? path.join(this.loader.directories.agents, 'workflows')
        : request.kind === 'template'
          ? path.join(this.loader.directories.workspace, 'templates')
          : request.kind === 'adr'
            ? path.join(this.loader.directories.workspace, 'decisions')
            : request.kind === 'knowledge'
              ? path.join(this.loader.directories.agents, 'knowledge')
              : path.join(this.loader.directories.workspace, 'specifications');
    return path.join(directory, `${request.name}.md`);
  }

  private deduplicate(requests: ContextDocumentRequest[]): ContextDocumentRequest[] {
    const seen = new Map<string, ContextDocumentRequest>();
    for (const request of requests) {
      const key = `${request.kind}:${request.name.toLowerCase()}`;
      const previous = seen.get(key);
      if (!previous || request.priority > previous.priority || request.required) {
        seen.set(key, previous ? {
          ...request,
          priority: Math.max(request.priority, previous.priority),
          required: request.required || previous.required,
        } : request);
      }
    }
    return [...seen.values()];
  }

  private normalizeName(name: string): string {
    return name.toLowerCase().endsWith('.md') ? name.slice(0, -3) : name;
  }
}

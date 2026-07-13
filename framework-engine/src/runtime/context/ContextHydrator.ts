import { LoaderError } from '../loader/LoaderErrors.ts';
import type { MarkdownLoader } from '../loader/MarkdownLoader.ts';
import { ContextAssembler } from './ContextAssembler.ts';
import { ContextBudget } from './ContextBudget.ts';
import { ContextResolver, InMemoryCapabilityRegistry, type CapabilityRegistry } from './ContextResolver.ts';
import { HydrationError } from './HydrationErrors.ts';
import { PromptAssembler } from './PromptAssembler.ts';
import type {
  ContextSnapshot,
  HydratedContext,
  HydratedDocument,
  WorkUnit,
} from './types.ts';

export interface ContextHydratorOptions {
  maxTokens?: number;
}

export class ContextHydrator {
  readonly budget: ContextBudget;
  private readonly resolver: ContextResolver;
  private readonly contextAssembler: ContextAssembler;
  private readonly promptAssembler: PromptAssembler;
  private readonly loader: MarkdownLoader;

  constructor(loader: MarkdownLoader, registry?: CapabilityRegistry, options: ContextHydratorOptions = {}) {
    this.loader = loader;
    const effectiveRegistry = registry ?? new InMemoryCapabilityRegistry();
    if (!registry && effectiveRegistry instanceof InMemoryCapabilityRegistry) {
      // The active capability is still resolved through a registry boundary when no external registry is supplied.
      this.resolver = new ContextResolver(loader, {
        get: (name) => ({ name }),
      });
    } else {
      this.resolver = new ContextResolver(loader, effectiveRegistry);
    }
    this.budget = new ContextBudget(options.maxTokens);
    this.contextAssembler = new ContextAssembler();
    this.promptAssembler = new PromptAssembler(this.contextAssembler);
  }

  async hydrate(workUnit: WorkUnit): Promise<HydratedContext> {
    const startedAt = Date.now();
    const requests = this.resolver.resolve(workUnit);
    const candidates: HydratedDocument[] = [];
    const seenPaths = new Set<string>();
    const discardedFiles: string[] = [];
    const warnings: string[] = [];

    for (const request of requests) {
      const documentPath = this.resolver.resolvePath(request);
      try {
        const document = await this.loader.loadDocument(documentPath);
        if (seenPaths.has(document.path)) {
          warnings.push(`Duplicate context document ignored: ${document.path}`);
          continue;
        }
        seenPaths.add(document.path);
        candidates.push({
          ...request,
          path: document.path,
          document,
          estimatedTokens: this.budget.estimateTokens(document.content),
        });
      } catch (error) {
        if (request.required) {
          throw new HydrationError(
            'REQUIRED_DOCUMENT_NOT_FOUND',
            `Required context document could not be loaded: ${request.name}`,
            { name: request.name, path: documentPath, cause: error instanceof Error ? error.message : String(error) },
          );
        }
        discardedFiles.push(documentPath);
        warnings.push(`Optional context document unavailable: ${request.name}`);
      }
    }

    const selection = this.budget.select(candidates);
    const budgetWarnings = selection.discarded.map((document) => `Context budget discarded: ${document.name}`);
    const allWarnings = [...warnings, ...budgetWarnings];
    const sections = this.promptAssembler.assemble(workUnit, selection.selected);
    const snapshot: ContextSnapshot = {
      loadedFiles: selection.selected.map((document) => document.path),
      discardedFiles: [...discardedFiles, ...selection.discarded.map((document) => document.path)],
      estimatedTokens: selection.statistics.usedTokens,
      budgetUsed: selection.statistics.usedTokens,
      capability: workUnit.capability,
      hydrationTimeMs: Date.now() - startedAt,
      warnings: allWarnings,
      statistics: selection.statistics,
    };
    return { sections, documents: selection.selected, snapshot };
  }
}

export { LoaderError };

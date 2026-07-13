import type { ContextAssembler } from './ContextAssembler.ts';
import type { HydratedDocument, PromptSections, WorkUnit } from './types.ts';

export class PromptAssembler {
  private readonly contextAssembler: ContextAssembler;

  constructor(contextAssembler: ContextAssembler) {
    this.contextAssembler = contextAssembler;
  }

  assemble(workUnit: WorkUnit, documents: HydratedDocument[]): PromptSections {
    return this.contextAssembler.toSections(workUnit, this.contextAssembler.assemble(documents));
  }
}

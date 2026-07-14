/**
 * PromptLayout
 *
 * Define e gerencia a disposição estrutural de seções de prompt.
 */

export interface PromptLayoutConfig {
  name: string;
  sectionsOrder: string[];
}

export const PRESETS_LAYOUTS: Record<string, PromptLayoutConfig> = {
  default: {
    name: 'Default',
    sectionsOrder: ['System', 'Architecture', 'Context', 'Knowledge', 'ADR', 'Rules', 'Task', 'History', 'Examples', 'Output Format'],
  },
  compact: {
    name: 'Compact',
    sectionsOrder: ['System', 'Task', 'Rules', 'Context', 'Output Format'],
  },
  architecture: {
    name: 'Architecture',
    sectionsOrder: ['System', 'Architecture', 'ADR', 'Rules', 'Task', 'Output Format'],
  },
  codeGeneration: {
    name: 'Code Generation',
    sectionsOrder: ['System', 'Context', 'Knowledge', 'Rules', 'Task', 'Templates', 'Output Format'],
  },
  review: {
    name: 'Review',
    sectionsOrder: ['System', 'Context', 'Rules', 'Task', 'Examples', 'Output Format'],
  },
  planning: {
    name: 'Planning',
    sectionsOrder: ['System', 'Workflow', 'Rules', 'Task', 'Output Format'],
  },
};

export class PromptLayout {
  readonly name: string;
  readonly sectionsOrder: string[];

  constructor(config: PromptLayoutConfig) {
    this.name = config.name;
    this.sectionsOrder = config.sectionsOrder;
  }

  static getPreset(presetName: string): PromptLayout {
    const config = PRESETS_LAYOUTS[presetName] ?? PRESETS_LAYOUTS.default;
    return new PromptLayout(config);
  }
}

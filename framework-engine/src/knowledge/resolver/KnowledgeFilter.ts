import type { KnowledgeDocument } from '../contracts/KnowledgeDocument.ts';

export interface ResolverFilterOptions {
  tags?: string[];
  metadata?: Record<string, any>;
  type?: string;
  extension?: string;
  category?: string;
  limit?: number;
}

export class KnowledgeFilter {
  filter(documents: KnowledgeDocument[], options: ResolverFilterOptions): KnowledgeDocument[] {
    let result = [...documents];

    if (options.extension) {
      const extLower = options.extension.toLowerCase().replace(/^\./, '');
      result = result.filter(doc => {
        const fileExt = doc.path.split('.').pop()?.toLowerCase();
        return fileExt === extLower;
      });
    }

    if (options.type) {
      result = result.filter(doc => doc.metadata.type === options.type);
    }

    if (options.category) {
      result = result.filter(doc => doc.metadata.category === options.category);
    }

    if (options.metadata) {
      for (const [key, value] of Object.entries(options.metadata)) {
        result = result.filter(doc => doc.metadata[key] === value);
      }
    }

    if (options.tags && options.tags.length > 0) {
      result = result.filter(doc => {
        const docTags = doc.metadata.tags || doc.metadata.keywords || [];
        if (Array.isArray(docTags)) {
          const lowerDocTags = docTags.map((t: any) => String(t).toLowerCase());
          return options.tags!.every(tag => lowerDocTags.includes(tag.toLowerCase()));
        }
        return false;
      });
    }

    if (typeof options.limit === 'number' && options.limit >= 0) {
      result = result.slice(0, options.limit);
    }

    return result;
  }
}

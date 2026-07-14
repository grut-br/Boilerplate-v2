import type { KnowledgeDocument } from '../contracts/KnowledgeDocument.ts';
import type { KnowledgeNode } from '../contracts/KnowledgeNode.ts';

export interface SelectionOptions {
  type?: string;
  metadata?: Record<string, any>;
  tags?: string[];
  limit?: number;
}

export class KnowledgeSelection {
  selectDocuments(documents: KnowledgeDocument[], options: SelectionOptions): KnowledgeDocument[] {
    let result = [...documents];

    if (options.type) {
      const typeLower = options.type.toLowerCase();
      result = result.filter(doc => {
        const ext = doc.path.split('.').pop()?.toLowerCase();
        return ext === typeLower || doc.metadata.type === options.type;
      });
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

  selectNodes(nodes: KnowledgeNode[], options: SelectionOptions): KnowledgeNode[] {
    let result = [...nodes];

    if (options.type) {
      result = result.filter(node => node.type === options.type);
    }

    if (options.metadata) {
      for (const [key, value] of Object.entries(options.metadata)) {
        result = result.filter(node => node.metadata[key] === value);
      }
    }

    if (options.tags && options.tags.length > 0) {
      result = result.filter(node => {
        const nodeTags = node.metadata.tags || node.metadata.keywords || [];
        if (Array.isArray(nodeTags)) {
          const lowerNodeTags = nodeTags.map((t: any) => String(t).toLowerCase());
          return options.tags!.every(tag => lowerNodeTags.includes(tag.toLowerCase()));
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

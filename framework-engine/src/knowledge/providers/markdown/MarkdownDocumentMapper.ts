import type { ParsedMarkdown } from './MarkdownDocumentParser.ts';
import type { KnowledgeDocument } from '../../contracts/KnowledgeDocument.ts';
import path from 'node:path';

export class MarkdownDocumentMapper {
  map(filePath: string, parsed: ParsedMarkdown): KnowledgeDocument {
    const id = path.basename(filePath, path.extname(filePath)).toLowerCase();

    return {
      id,
      path: path.resolve(filePath),
      content: parsed.content,
      metadata: {
        title: parsed.title,
        headings: parsed.headings,
        links: parsed.links,
        ...parsed.metadata,
      },
    };
  }
}

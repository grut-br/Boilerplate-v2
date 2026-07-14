import type { KnowledgeProvider } from '../../contracts/KnowledgeProvider.ts';
import type { KnowledgeRequest } from '../../contracts/KnowledgeRequest.ts';
import type { KnowledgeResult } from '../../contracts/KnowledgeResult.ts';
import type { KnowledgeDocument } from '../../contracts/KnowledgeDocument.ts';
import { MarkdownDocumentLoader } from './MarkdownDocumentLoader.ts';
import { MarkdownDocumentParser } from './MarkdownDocumentParser.ts';
import { MarkdownDocumentMapper } from './MarkdownDocumentMapper.ts';
import type { MarkdownConfiguration } from './MarkdownConfiguration.ts';

export class MarkdownKnowledgeProvider implements KnowledgeProvider {
  readonly id = 'markdown';
  readonly name = 'Markdown Knowledge Provider';

  private readonly config: MarkdownConfiguration;
  private readonly loader: MarkdownDocumentLoader;
  private readonly parser: MarkdownDocumentParser;
  private readonly mapper: MarkdownDocumentMapper;
  private status: 'idle' | 'initialized' | 'shutdown' = 'idle';

  constructor(config: MarkdownConfiguration) {
    this.config = config;
    this.loader = new MarkdownDocumentLoader(config);
    this.parser = new MarkdownDocumentParser();
    this.mapper = new MarkdownDocumentMapper();
  }

  async initialize(): Promise<void> {
    this.status = 'initialized';
  }

  async shutdown(): Promise<void> {
    this.status = 'shutdown';
  }

  getStatus(): string {
    return this.status;
  }

  async query(request: KnowledgeRequest): Promise<KnowledgeResult> {
    const startedAt = Date.now();
    
    const files = this.loader.locateFiles();
    let documents: KnowledgeDocument[] = [];

    for (const file of files) {
      const parsed = this.parser.parse(file, this.config.encoding);
      const doc = this.mapper.map(file, parsed);
      documents.push(doc);
    }

    if (request.query && request.query.trim() !== '' && request.query !== '*') {
      const q = request.query.toLowerCase();
      documents = documents.filter(doc => 
        doc.content.toLowerCase().includes(q) || 
        (doc.metadata.title && String(doc.metadata.title).toLowerCase().includes(q))
      );
    }

    if (request.filters) {
      for (const [key, value] of Object.entries(request.filters)) {
        documents = documents.filter(doc => doc.metadata[key] === value);
      }
    }

    return {
      documents,
      nodes: [],
      metadata: {
        workspace: this.config.workspace,
        totalFilesScanned: files.length,
        count: documents.length,
      },
      diagnostics: {
        scannedCount: files.length,
        matchedCount: documents.length,
      },
      duration: Date.now() - startedAt,
    };
  }
}

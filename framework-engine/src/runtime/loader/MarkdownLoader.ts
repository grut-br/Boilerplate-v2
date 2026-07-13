import path from 'node:path';
import { CapabilityLocator, type DocumentKind } from './CapabilityLocator.ts';
import { DocumentCache } from './DocumentCache.ts';
import { DirectoryScanner, type FrameworkDirectories } from './DirectoryScanner.ts';
import { LoaderError } from './LoaderErrors.ts';
import { MarkdownParser, type MarkdownDocument } from './MarkdownParser.ts';

export interface MarkdownLoaderOptions {
  startPath?: string;
  directories?: FrameworkDirectories;
}

export class MarkdownLoader {
  readonly directories: FrameworkDirectories;
  readonly cache = new DocumentCache<MarkdownDocument>();
  private readonly scanner: DirectoryScanner;
  private readonly parser: MarkdownParser;
  private readonly locator: CapabilityLocator;

  constructor(options: MarkdownLoaderOptions = {}) {
    this.scanner = new DirectoryScanner();
    this.parser = new MarkdownParser();
    this.directories = options.directories ?? this.scanner.findFrameworkRoot(options.startPath);
    this.locator = new CapabilityLocator(this.directories);
  }

  loadCapability(name: string): Promise<MarkdownDocument> {
    return this.loadLocated('capability', name);
  }

  loadRule(name: string): Promise<MarkdownDocument> {
    return this.loadLocated('rule', name);
  }

  loadWorkflow(name: string): Promise<MarkdownDocument> {
    return this.loadLocated('workflow', name);
  }

  loadSpecification(name: string): Promise<MarkdownDocument> {
    return this.loadLocated('specification', name);
  }

  async loadDocument(filePath: string): Promise<MarkdownDocument> {
    const absolutePath = path.resolve(filePath);
    const cached = this.cache.get(absolutePath);
    if (cached) {
      return cached.document;
    }
    const document = await this.parser.parse(absolutePath);
    this.cache.set(absolutePath, document);
    return document;
  }

  scan(kind: DocumentKind): string[] {
    return this.scanner.scanMarkdown(this.locator.directoryFor(kind));
  }

  invalidateCache(filePath?: string): boolean {
    return this.cache.invalidate(filePath);
  }

  clearCache(): void {
    this.cache.clear();
  }

  private async loadLocated(kind: DocumentKind, name: string): Promise<MarkdownDocument> {
    const documentPath = this.locator.locate(kind, name);
    return this.loadDocument(documentPath);
  }
}

export { LoaderError } from './LoaderErrors.ts';

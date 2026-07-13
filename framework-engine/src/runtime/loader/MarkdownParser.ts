import fs from 'node:fs/promises';
import path from 'node:path';
import { LoaderError } from './LoaderErrors.ts';

export interface MarkdownDocument {
  path: string;
  name: string;
  content: string;
  loadedAt: number;
}

export class MarkdownParser {
  async parse(filePath: string): Promise<MarkdownDocument> {
    const absolutePath = path.resolve(filePath);
    let bytes: Uint8Array;
    try {
      bytes = await fs.readFile(absolutePath);
    } catch (error) {
      throw new LoaderError('READ_ERROR', `Unable to read Markdown document: ${absolutePath}`, {
        path: absolutePath,
        cause: error instanceof Error ? error.message : String(error),
      });
    }

    let content: string;
    try {
      content = new TextDecoder('utf-8', { fatal: true }).decode(bytes);
    } catch {
      throw new LoaderError('INVALID_ENCODING', `Markdown document is not valid UTF-8: ${absolutePath}`, {
        path: absolutePath,
      });
    }

    if (!absolutePath.toLowerCase().endsWith('.md')) {
      throw new LoaderError('INVALID_MARKDOWN', `Document is not Markdown: ${absolutePath}`, {
        path: absolutePath,
      });
    }

    return {
      path: absolutePath,
      name: path.basename(absolutePath, path.extname(absolutePath)),
      content,
      loadedAt: Date.now(),
    };
  }
}

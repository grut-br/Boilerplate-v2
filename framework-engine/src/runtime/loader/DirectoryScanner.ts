import fs from 'node:fs';
import path from 'node:path';
import { LoaderError } from './LoaderErrors.ts';

export interface FrameworkDirectories {
  root: string;
  agents: string;
  workspace: string;
}

export class DirectoryScanner {
  findFrameworkRoot(startPath = process.cwd()): FrameworkDirectories {
    let current = path.resolve(startPath);

    if (!this.isDirectory(current)) {
      current = path.dirname(current);
    }

    while (true) {
      const agents = path.join(current, '.agents');
      const workspace = path.join(current, '.ai-workspace');
      if (this.isDirectory(agents) && this.isDirectory(workspace)) {
        return { root: current, agents, workspace };
      }

      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
    }

    throw new LoaderError(
      'FRAMEWORK_ROOT_NOT_FOUND',
      `Framework root not found from: ${startPath}`,
      { path: path.resolve(startPath) },
    );
  }

  scanMarkdown(directory: string): string[] {
    if (!this.isDirectory(directory)) {
      throw new LoaderError('DIRECTORY_NOT_FOUND', `Directory not found: ${directory}`, {
        path: path.resolve(directory),
      });
    }

    const documents: string[] = [];
    this.walk(directory, documents);
    this.assertNoDuplicateNames(documents);
    return documents.sort((left, right) => left.localeCompare(right));
  }

  private walk(directory: string, documents: string[]): void {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        this.walk(entryPath, documents);
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md')) {
        documents.push(path.resolve(entryPath));
      }
    }
  }

  private assertNoDuplicateNames(documents: string[]): void {
    const names = new Map<string, string>();
    for (const document of documents) {
      const name = path.basename(document, path.extname(document)).toLowerCase();
      const previous = names.get(name);
      if (previous) {
        throw new LoaderError(
          'DUPLICATE_DOCUMENT',
          `Duplicate Markdown document name: ${name}`,
          { path: document, name, cause: previous },
        );
      }
      names.set(name, document);
    }
  }

  private isDirectory(directory: string): boolean {
    try {
      return fs.statSync(directory).isDirectory();
    } catch {
      return false;
    }
  }
}

import fs from 'node:fs';
import path from 'node:path';
import type { MarkdownConfiguration } from './MarkdownConfiguration.ts';
import { MarkdownNotFound } from './MarkdownErrors.ts';

export class MarkdownDocumentLoader {
  private readonly config: MarkdownConfiguration;

  constructor(config: MarkdownConfiguration) {
    this.config = config;
  }

  locateFiles(): string[] {
    const workspace = path.resolve(this.config.workspace);
    if (!fs.existsSync(workspace) || !fs.statSync(workspace).isDirectory()) {
      throw new MarkdownNotFound(workspace, `Workspace directory not found: ${workspace}`);
    }

    const files: string[] = [];
    const extensions = this.config.extensions ?? ['.md'];
    const ignorePatterns = this.config.ignorePatterns ?? ['node_modules', '.git', '.next'];

    const walk = (dir: string) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        const shouldIgnore = ignorePatterns.some(pattern => {
          const normalizedPath = fullPath.replace(/\\/g, '/');
          return normalizedPath.includes(pattern) || entry.name === pattern;
        });

        if (shouldIgnore) {
          continue;
        }

        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };

    walk(workspace);
    return files;
  }
}

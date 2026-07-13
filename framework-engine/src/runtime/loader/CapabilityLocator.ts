import fs from 'node:fs';
import path from 'node:path';
import { LoaderError } from './LoaderErrors.ts';
import type { FrameworkDirectories } from './DirectoryScanner.ts';

export type DocumentKind = 'capability' | 'rule' | 'workflow' | 'specification';

export class CapabilityLocator {
  private readonly directories: FrameworkDirectories;

  constructor(directories: FrameworkDirectories) {
    this.directories = directories;
  }

  locate(kind: DocumentKind, name: string): string {
    this.validateName(name);
    const directory = this.directoryFor(kind);
    const documentPath = path.resolve(directory, `${name}.md`);
    if (!this.isInside(directory, documentPath)) {
      throw new LoaderError('INVALID_DOCUMENT_NAME', `Invalid document name: ${name}`, { name });
    }
    if (!this.isFile(documentPath)) {
      throw new LoaderError('DOCUMENT_NOT_FOUND', `${kind} not found: ${name}`, {
        path: documentPath,
        name,
      });
    }
    return documentPath;
  }

  directoryFor(kind: DocumentKind): string {
    switch (kind) {
      case 'capability':
        return path.join(this.directories.agents, 'capabilities');
      case 'rule':
        return path.join(this.directories.agents, 'rules');
      case 'workflow':
        return path.join(this.directories.agents, 'workflows');
      case 'specification':
        return path.join(this.directories.workspace, 'specifications');
    }
  }

  private validateName(name: string): void {
    if (!name || path.isAbsolute(name) || name.includes('..') || name.includes('\\')) {
      throw new LoaderError('INVALID_DOCUMENT_NAME', `Invalid document name: ${name}`, { name });
    }
  }

  private isInside(directory: string, filePath: string): boolean {
    const relative = path.relative(path.resolve(directory), filePath);
    return relative !== '' && !relative.startsWith(`..${path.sep}`) && relative !== '..';
  }

  private isFile(filePath: string): boolean {
    try {
      return fs.statSync(filePath).isFile();
    } catch {
      return false;
    }
  }
}

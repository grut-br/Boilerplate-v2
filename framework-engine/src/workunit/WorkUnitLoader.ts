import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { WorkUnitNotFound } from './WorkUnitErrors.ts';

export class WorkUnitLoader {
  async load(filePath: string): Promise<string> {
    const absolutePath = path.resolve(filePath);

    try {
      return await readFile(absolutePath, 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new WorkUnitNotFound(absolutePath);
      }
      throw error;
    }
  }
}

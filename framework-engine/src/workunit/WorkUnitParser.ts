import { InvalidMetadata, WorkUnitParsingError } from './WorkUnitErrors.ts';
import { WorkUnitMetadata } from './WorkUnitMetadata.ts';
import { WorkUnitSchema } from './WorkUnitSchema.ts';
import type { WorkUnit } from './WorkUnit.ts';

type ParsedFields = Record<string, string | string[]>;

export class WorkUnitParser {
  parse(rawContent: string): WorkUnit {
    try {
      const { fields, body } = this.parseFrontMatter(rawContent);
      const sections = this.parseSections(body);
      const title = this.value(fields.title) || this.heading(body, 1);
      const description = this.value(fields.description) || this.section(body, 'Description');
      const metadata = new WorkUnitMetadata({
        version: this.value(fields.version),
        date: this.value(fields.date) || this.value(fields.createdAt),
        author: this.value(fields.author),
        tags: this.list(fields.tags),
        priority: this.value(fields.priority),
        category: this.value(fields.category),
      });

      if (!title || !description) throw new InvalidMetadata('Work Unit title and description are required.');

      return {
        id: this.value(fields.id),
        title,
        description,
        objective: this.value(fields.objective) || this.section(body, 'Objective'),
        capability: this.value(fields.capability),
        workflow: this.value(fields.workflow),
        priority: this.value(fields.priority) || metadata.priority,
        tags: this.list(fields.tags),
        status: this.value(fields.status) || 'draft',
        author: this.value(fields.author) || metadata.author,
        createdAt: this.value(fields.createdAt) || metadata.date,
        rawContent,
        metadata,
        body,
        instructions: sections.Instructions,
        references: this.lines(sections.References),
        checklist: this.lines(sections.Checklist),
      };
    } catch (error) {
      if (error instanceof InvalidMetadata) throw error;
      if (error instanceof WorkUnitParsingError) throw error;
      throw new WorkUnitParsingError('Unable to parse Work Unit markdown.', { cause: error });
    }
  }

  private parseFrontMatter(rawContent: string): { fields: ParsedFields; body: string } {
    const normalized = rawContent.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
    if (!normalized.startsWith('---\n')) return { fields: {}, body: normalized };

    const end = normalized.indexOf('\n---', 4);
    if (end === -1) throw new InvalidMetadata('Work Unit front matter is not closed.');

    const frontMatter = normalized.slice(4, end).trim();
    const fields: ParsedFields = {};
    for (const line of frontMatter.split('\n')) {
      const separator = line.indexOf(':');
      if (separator <= 0) throw new InvalidMetadata(`Invalid metadata line: ${line}`);
      const key = line.slice(0, separator).trim();
      const value = line.slice(separator + 1).trim();
      if (!key || !value) throw new InvalidMetadata(`Invalid metadata value for ${key || 'unknown'}.`);
      fields[key] = this.parseValue(value);
    }

    return { fields, body: normalized.slice(end + 4).replace(/^\n/, '').trim() };
  }

  private parseSections(body: string): Record<string, string> {
    const sections: Record<string, string> = {
      Instructions: '',
      References: '',
      Checklist: '',
    };
    const matches = [...body.matchAll(/^##\s+(.+)$/gm)];
    for (let index = 0; index < matches.length; index += 1) {
      const match = matches[index];
      const name = match[1].trim();
      const start = (match.index ?? 0) + match[0].length;
      const end = matches[index + 1]?.index ?? body.length;
      if (name in sections) sections[name] = body.slice(start, end).trim();
    }
    return sections;
  }

  private section(body: string, name: string): string {
    const match = body.match(new RegExp(`^##\\s+${name}\\s*$([\\s\\S]*?)(?=^##\\s+|$)`, 'm'));
    return match?.[1].trim() ?? '';
  }

  private heading(body: string, level: number): string {
    return body.match(new RegExp(`^#{${level}}\\s+(.+)$`, 'm'))?.[1].trim() ?? '';
  }

  private parseValue(value: string): string | string[] {
    if (value.startsWith('[') && value.endsWith(']')) return this.list(value);
    return value.replace(/^['"]|['"]$/g, '');
  }

  private value(value: string | string[] | undefined): string {
    return typeof value === 'string' ? value.trim() : '';
  }

  private list(value: string | string[] | undefined): string[] {
    if (Array.isArray(value)) return value;
    if (!value) return [];
    const source = value.replace(/^\[|\]$/g, '');
    return source.split(',').map((item) => item.trim().replace(/^['"]|['"]$/g, '')).filter(Boolean);
  }

  private lines(value: string): string[] {
    return value.split('\n').map((line) => line.replace(/^\s*[-*]\s+/, '').trim()).filter(Boolean);
  }
}

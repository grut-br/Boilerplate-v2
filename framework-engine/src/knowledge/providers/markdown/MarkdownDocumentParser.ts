import fs from 'node:fs';
import path from 'node:path';
import { MarkdownParseError } from './MarkdownErrors.ts';

export interface ParsedMarkdown {
  title: string;
  headings: Array<{ level: number; text: string }>;
  content: string;
  metadata: Record<string, any>;
  links: Array<{ text: string; url: string }>;
}

export class MarkdownDocumentParser {
  parse(filePath: string, encoding = 'utf-8'): ParsedMarkdown {
    let rawContent: string;
    try {
      rawContent = fs.readFileSync(filePath, { encoding: encoding as BufferEncoding });
    } catch (error) {
      throw new MarkdownParseError(filePath, `Error reading file ${filePath}`, error);
    }

    const lines = rawContent.split(/\r?\n/);
    const metadata: Record<string, any> = {};
    let contentStartLine = 0;

    // Parse Frontmatter
    if (lines[0] === '---') {
      let i = 1;
      while (i < lines.length && lines[i] !== '---') {
        const line = lines[i];
        const match = line.match(/^([^:]+):\s*(.*)$/);
        if (match) {
          const key = match[1].trim();
          let value: any = match[2].trim();
          
          if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
            value = value.substring(1, value.length - 1);
          }
          metadata[key] = value;
        }
        i++;
      }
      if (i < lines.length && lines[i] === '---') {
        contentStartLine = i + 1;
      }
    }

    const contentLines = lines.slice(contentStartLine);
    const content = contentLines.join('\n');

    const headings: Array<{ level: number; text: string }> = [];
    let title = metadata.title ?? '';

    for (const line of contentLines) {
      const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
      if (headingMatch) {
        const level = headingMatch[1].length;
        const text = headingMatch[2].trim();
        headings.push({ level, text });
        if (!title && level === 1) {
          title = text;
        }
      }
    }

    if (!title) {
      title = path.basename(filePath, path.extname(filePath));
    }

    const links: Array<{ text: string; url: string }> = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let match;
    while ((match = linkRegex.exec(content)) !== null) {
      links.push({
        text: match[1],
        url: match[2],
      });
    }

    return {
      title,
      headings,
      content,
      metadata,
      links,
    };
  }
}

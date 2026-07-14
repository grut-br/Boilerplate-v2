import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { KnowledgeProviderFactory } from '../../runtime/KnowledgeProviderFactory.ts';
import { KnowledgeProviderRegistry } from '../../runtime/KnowledgeProviderRegistry.ts';
import { KnowledgeProviderExecutor } from '../../runtime/KnowledgeProviderExecutor.ts';
import { MarkdownKnowledgeProvider } from './MarkdownKnowledgeProvider.ts';
import { MarkdownDocumentParser } from './MarkdownDocumentParser.ts';
import { MarkdownDocumentMapper } from './MarkdownDocumentMapper.ts';
import { MarkdownNotFound } from './MarkdownErrors.ts';

test('MarkdownKnowledgeProvider - Automatic registration in factory', () => {
  const factory = new KnowledgeProviderFactory();
  assert.equal(factory.has('markdown'), true);
});

test('MarkdownDocumentParser - extracts frontmatter, headings, content, and links', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'md-parser-test-'));
  const filePath = path.join(tempDir, 'test-doc.md');

  const content = `---
title: "Document Title"
category: "architecture"
---
# Main Header
Some introduction.

## Section 1
Here is a link to [Google](https://google.com) and another link to [GitHub](https://github.com).
`;

  try {
    await writeFile(filePath, content, 'utf8');

    const parser = new MarkdownDocumentParser();
    const result = parser.parse(filePath);

    assert.equal(result.title, 'Document Title');
    assert.equal(result.metadata.category, 'architecture');
    assert.equal(result.headings.length, 2);
    assert.equal(result.headings[0].level, 1);
    assert.equal(result.headings[0].text, 'Main Header');
    assert.equal(result.headings[1].level, 2);
    assert.equal(result.headings[1].text, 'Section 1');
    assert.equal(result.links.length, 2);
    assert.equal(result.links[0].text, 'Google');
    assert.equal(result.links[0].url, 'https://google.com');
    assert.equal(result.links[1].text, 'GitHub');
    assert.equal(result.links[1].url, 'https://github.com');
    assert.ok(result.content.includes('Here is a link'));
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('MarkdownDocumentMapper - maps parsed to KnowledgeDocument', () => {
  const mapper = new MarkdownDocumentMapper();
  const parsed = {
    title: 'Custom Title',
    headings: [{ level: 1, text: 'Heading' }],
    content: 'Content text',
    metadata: { key: 'value' },
    links: [{ text: 'Google', url: 'https://google.com' }],
  };

  const doc = mapper.map('/path/to/my-file.md', parsed);
  assert.equal(doc.id, 'my-file');
  assert.equal(doc.path, path.resolve('/path/to/my-file.md'));
  assert.equal(doc.content, 'Content text');
  assert.equal(doc.metadata.title, 'Custom Title');
  assert.equal(doc.metadata.key, 'value');
  assert.deepEqual(doc.metadata.headings, parsed.headings);
  assert.deepEqual(doc.metadata.links, parsed.links);
});

test('MarkdownKnowledgeProvider - End-to-end load, map, and query filtering', async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), 'md-provider-test-'));
  const file1 = path.join(tempDir, 'file1.md');
  const file2 = path.join(tempDir, 'file2.md');

  const content1 = `---
title: File One
category: backend
---
# File One
This is about Next.js and Supabase database.
`;

  const content2 = `---
title: File Two
category: frontend
---
# File Two
This is about Tailwind CSS styling.
`;

  try {
    await writeFile(file1, content1, 'utf8');
    await writeFile(file2, content2, 'utf8');

    const provider = new MarkdownKnowledgeProvider({
      workspace: tempDir,
    });

    await provider.initialize();

    const resultAll = await provider.query({ query: '*', workspace: tempDir });
    assert.equal(resultAll.documents.length, 2);
    assert.equal(resultAll.metadata.totalFilesScanned, 2);

    const resultQuery = await provider.query({ query: 'tailwind', workspace: tempDir });
    assert.equal(resultQuery.documents.length, 1);
    assert.equal(resultQuery.documents[0].id, 'file2');

    const resultFilter = await provider.query({
      query: '*',
      workspace: tempDir,
      filters: { category: 'backend' },
    });
    assert.equal(resultFilter.documents.length, 1);
    assert.equal(resultFilter.documents[0].id, 'file1');

    await provider.shutdown();
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test('MarkdownKnowledgeProvider - error on missing workspace', async () => {
  const provider = new MarkdownKnowledgeProvider({
    workspace: '/non-existent-directory-abc-123',
  });

  await assert.rejects(async () => {
    await provider.query({ query: '*', workspace: '/non-existent-directory-abc-123' });
  }, MarkdownNotFound);
});

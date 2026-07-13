import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { DirectoryScanner } from './DirectoryScanner.ts';
import { LoaderError } from './LoaderErrors.ts';
import { MarkdownLoader } from './MarkdownLoader.ts';
import { MarkdownParser } from './MarkdownParser.ts';

async function fixture(): Promise<string> {
  const root = await mkdtemp(path.join(os.tmpdir(), 'framework-loader-'));
  await mkdir(path.join(root, '.agents', 'capabilities'), { recursive: true });
  await mkdir(path.join(root, '.agents', 'rules'), { recursive: true });
  await mkdir(path.join(root, '.agents', 'workflows'), { recursive: true });
  await mkdir(path.join(root, '.ai-workspace', 'specifications'), { recursive: true });
  await writeFile(path.join(root, '.agents', 'capabilities', 'analysis.md'), '# Analysis\n', 'utf8');
  await writeFile(path.join(root, '.agents', 'rules', 'always-read.md'), '# Rules\n', 'utf8');
  await writeFile(path.join(root, '.agents', 'workflows', 'review.md'), '# Review\n', 'utf8');
  await writeFile(path.join(root, '.ai-workspace', 'specifications', 'runtime.md'), '# Runtime\n', 'utf8');
  return root;
}

test('finds the framework root from a nested path and loads all document kinds', async () => {
  const root = await fixture();
  try {
    const loader = new MarkdownLoader({ startPath: path.join(root, '.agents', 'capabilities') });
    assert.equal(loader.directories.root, root);
    assert.equal((await loader.loadCapability('analysis')).content, '# Analysis\n');
    assert.equal((await loader.loadRule('always-read')).name, 'always-read');
    assert.equal((await loader.loadWorkflow('review')).name, 'review');
    assert.equal((await loader.loadSpecification('runtime')).name, 'runtime');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('caches documents and supports targeted and full invalidation', async () => {
  const root = await fixture();
  try {
    const documentPath = path.join(root, '.agents', 'capabilities', 'analysis.md');
    const loader = new MarkdownLoader({ startPath: root });
    const first = await loader.loadCapability('analysis');
    await writeFile(documentPath, '# Changed\n', 'utf8');
    assert.equal((await loader.loadCapability('analysis')).content, '# Analysis\n');
    assert.equal(loader.cache.size, 1);
    assert.equal(loader.invalidateCache(documentPath), true);
    assert.equal((await loader.loadCapability('analysis')).content, '# Changed\n');
    assert.equal(loader.invalidateCache(), true);
    assert.equal(loader.cache.size, 0);
    assert.notEqual(first.loadedAt, (await loader.loadCapability('analysis')).loadedAt);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('scans Markdown files and rejects duplicate logical names', async () => {
  const root = await fixture();
  try {
    const scanner = new DirectoryScanner();
    const capabilities = scanner.scanMarkdown(path.join(root, '.agents', 'capabilities'));
    assert.equal(capabilities.length, 1);
    await mkdir(path.join(root, '.agents', 'capabilities', 'nested'));
    await writeFile(path.join(root, '.agents', 'capabilities', 'nested', 'analysis.md'), '# Duplicate', 'utf8');
    assert.throws(
      () => scanner.scanMarkdown(path.join(root, '.agents', 'capabilities')),
      (error: unknown) => error instanceof LoaderError && error.code === 'DUPLICATE_DOCUMENT',
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('returns structured errors for missing names, invalid names and missing roots', async () => {
  const root = await fixture();
  const orphanRoot = await mkdtemp(path.join(os.tmpdir(), 'framework-no-root-'));
  try {
    const loader = new MarkdownLoader({ startPath: root });
    await assert.rejects(() => loader.loadCapability('missing'), (error: unknown) => {
      return error instanceof LoaderError && error.code === 'DOCUMENT_NOT_FOUND';
    });
    await assert.rejects(() => loader.loadCapability('../rules/always-read'), (error: unknown) => {
      return error instanceof LoaderError && error.code === 'INVALID_DOCUMENT_NAME';
    });
    assert.throws(() => new MarkdownLoader({ startPath: orphanRoot }), (error: unknown) => {
      return error instanceof LoaderError && error.code === 'FRAMEWORK_ROOT_NOT_FOUND';
    });
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(orphanRoot, { recursive: true, force: true });
  }
});

test('rejects invalid UTF-8 and non-Markdown documents', async () => {
  const root = await fixture();
  try {
    const parser = new MarkdownParser();
    const invalidPath = path.join(root, 'invalid.md');
    const textPath = path.join(root, 'document.txt');
    await writeFile(invalidPath, Buffer.from([0xc3, 0x28]));
    await writeFile(textPath, 'plain text', 'utf8');
    await assert.rejects(() => parser.parse(invalidPath), (error: unknown) => {
      return error instanceof LoaderError && error.code === 'INVALID_ENCODING';
    });
    await assert.rejects(() => parser.parse(textPath), (error: unknown) => {
      return error instanceof LoaderError && error.code === 'INVALID_MARKDOWN';
    });
    assert.equal((await readFile(textPath, 'utf8')), 'plain text');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

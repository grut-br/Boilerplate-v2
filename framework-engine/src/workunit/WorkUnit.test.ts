import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { Runtime, RuntimeState } from '../runtime/index.ts';
import {
  InvalidCapability,
  InvalidMetadata,
  InvalidWorkflow,
  InvalidWorkUnit,
  WorkUnitLoader,
  WorkUnitNotFound,
  WorkUnitParser,
  WorkUnitParsingError,
  WorkUnitValidator,
} from './index.ts';

const validMarkdown = `---
id: WU-041
title: Load a Work Unit
description: Establish the physical Work Unit input.
objective: Load and validate a development demand.
capability: runtime-foundation
workflow: standard-runtime
priority: high
tags: [runtime, foundation]
status: pending
author: devio
createdAt: 2026-07-14T00:00:00.000Z
version: 1.0
date: 2026-07-14
category: runtime
---

# Work Unit

## Instructions

- Load the source markdown.
- Validate its required fields.

## References

- .architecture/ARCHITECTURE_FREEZE.md

## Checklist

- [ ] Implement loader
- [x] Preserve raw content
`;

async function withWorkUnitFile(content: string, callback: (filePath: string) => Promise<void>): Promise<void> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'devio-workunit-'));
  const filePath = path.join(directory, 'work-unit.md');
  await writeFile(filePath, content, 'utf8');
  try {
    await callback(filePath);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

test('loader returns the raw markdown content', async () => {
  const loader = new WorkUnitLoader();
  await withWorkUnitFile(validMarkdown, async (filePath) => {
    assert.equal(await loader.load(filePath), validMarkdown);
    assert.equal(await readFile(filePath, 'utf8'), validMarkdown);
  });
});

test('loader throws when the Work Unit file does not exist', async () => {
  await assert.rejects(() => new WorkUnitLoader().load(path.join(os.tmpdir(), 'missing-work-unit.md')), WorkUnitNotFound);
});

test('parser converts markdown into a Work Unit and separates sections', () => {
  const workUnit = new WorkUnitParser().parse(validMarkdown);

  assert.equal(workUnit.id, 'WU-041');
  assert.equal(workUnit.objective, 'Load and validate a development demand.');
  assert.equal(workUnit.metadata.category, 'runtime');
  assert.deepEqual(workUnit.tags, ['runtime', 'foundation']);
  assert.match(workUnit.instructions, /Load the source markdown/);
  assert.deepEqual(workUnit.references, ['.architecture/ARCHITECTURE_FREEZE.md']);
  assert.deepEqual(workUnit.checklist, ['[ ] Implement loader', '[x] Preserve raw content']);
  assert.equal(workUnit.rawContent, validMarkdown);
});

test('parser rejects malformed metadata and invalid markdown structure', () => {
  assert.throws(() => new WorkUnitParser().parse('---\nid: WU-1\n'), InvalidMetadata);
  assert.throws(() => new WorkUnitParser().parse('---\nid: WU-1\n---\n'), InvalidMetadata);
  assert.throws(() => new WorkUnitParser().parse(null as unknown as string), WorkUnitParsingError);
});

test('validator accepts a valid Work Unit', () => {
  const workUnit = new WorkUnitParser().parse(validMarkdown);
  assert.equal(new WorkUnitValidator().validate(workUnit), workUnit);
});

test('validator reports missing required fields', () => {
  const workUnit = new WorkUnitParser().parse(validMarkdown);
  assert.throws(() => new WorkUnitValidator().validate({ ...workUnit, id: '' }), InvalidWorkUnit);
  assert.throws(() => new WorkUnitValidator().validate({ ...workUnit, objective: '' }), InvalidWorkUnit);
});

test('validator reports invalid capability and workflow identifiers', () => {
  const workUnit = new WorkUnitParser().parse(validMarkdown);
  assert.throws(() => new WorkUnitValidator().validate({ ...workUnit, capability: 'invalid capability' }), InvalidCapability);
  assert.throws(() => new WorkUnitValidator().validate({ ...workUnit, workflow: 'invalid workflow' }), InvalidWorkflow);
});

test('Runtime loads, validates and exposes a Work Unit without executing it', async () => {
  const runtime = new Runtime();
  runtime.initialize('/workspace');

  await withWorkUnitFile(validMarkdown, async (filePath) => {
    const workUnit = await runtime.loadWorkUnit(filePath);
    const snapshot = runtime.snapshot();

    assert.equal(workUnit.id, 'WU-041');
    assert.equal(runtime.state, RuntimeState.Initialized);
    assert.equal(runtime.context?.currentWorkUnit, workUnit);
    assert.equal(snapshot.loadedWorkUnit?.id, 'WU-041');
    assert.equal(snapshot.metrics.readTime !== undefined, true);
    assert.equal(snapshot.metrics.parsingTime !== undefined, true);
    assert.equal(snapshot.metrics.validationTime !== undefined, true);
  });
});

test('Runtime enters Failed when Work Unit loading fails', async () => {
  const runtime = new Runtime();
  runtime.initialize('/workspace');

  await assert.rejects(() => runtime.loadWorkUnit(path.join(os.tmpdir(), 'missing-work-unit.md')), WorkUnitNotFound);
  assert.equal(runtime.state, RuntimeState.Failed);
});

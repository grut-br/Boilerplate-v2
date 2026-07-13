import assert from 'node:assert/strict';
import test from 'node:test';
import { CLI, parseArguments } from './CLI.ts';
import { ErrorFormatter } from './ErrorFormatter.ts';
import { HelpFormatter } from './HelpFormatter.ts';
import { OutputFormatter } from './OutputFormatter.ts';
import type { EnginePort } from './EnginePort.ts';

function engineMock(calls: string[]): EnginePort {
  return {
    doctor: () => ({ node: { version: 'v24', valid: true }, packageManager: { name: 'npm', valid: true }, workspace: { open: true, valid: true }, configuration: { valid: true }, provider: { available: true, valid: true }, engine: { version: '3.1.0', state: 'ready', valid: true } }),
    status: () => ({ version: '3.1.0', workspace: '/tmp/project', provider: 'mock', documentCount: 4, state: 'ready' }),
    openWorkspace: (path) => { calls.push(`workspace:${path}`); return { path }; },
    listProviders: () => [{ name: 'mock', type: 'mock', active: true, available: true }],
    version: () => ({ version: '3.1.0', build: 'local', commit: 'abc' }),
  };
}

test('parseArguments separates command, positionals and options', () => {
  assert.deepEqual(parseArguments(['workspace', './project', '--pretty']), {
    command: 'workspace',
    positionals: ['./project'],
    options: { pretty: true },
  });
  assert.deepEqual(parseArguments(['status', '--format=json']), {
    command: 'status',
    positionals: [],
    options: { format: 'json' },
  });
});

test('doctor delegates to the Engine', async () => {
  const cli = new CLI(engineMock([]));
  const result = await cli.run(['doctor']);
  assert.equal(result.success, true);
  assert.equal((result.data as { engine: { state: string } }).engine.state, 'ready');
});

test('status, providers and version delegate to the Engine', async () => {
  const cli = new CLI(engineMock([]));
  assert.equal((await cli.run(['status'])).success, true);
  assert.equal((await cli.run(['providers'])).success, true);
  assert.equal((await cli.run(['version'])).success, true);
});

test('workspace validates its path and delegates it', async () => {
  const calls: string[] = [];
  const cli = new CLI(engineMock(calls));
  assert.equal((await cli.run(['workspace'])).success, false);
  assert.equal((await cli.run(['workspace', './project'])).success, true);
  assert.deepEqual(calls, ['workspace:./project']);
});

test('unknown commands return a structured error', async () => {
  const result = await new CLI(engineMock([])).run(['execute']);
  assert.deepEqual(result, {
    command: 'execute',
    success: false,
    exitCode: 1,
    message: 'Unknown command: execute',
    errorCode: 'UNKNOWN_COMMAND',
  });
});

test('help is available globally and per command', async () => {
  const cli = new CLI(engineMock([]));
  const globalHelp = await cli.run(['--help']);
  const doctorHelp = await cli.run(['doctor', '--help']);
  const providerHelp = await cli.run(['provider', '--help']);

  assert.match(globalHelp.data as string, /Commands:/);
  assert.match(doctorHelp.data as string, /framework doctor/);
  assert.match(providerHelp.data as string, /framework provider/);
});

test('formatters support pretty, JSON, quiet and verbose output', async () => {
  const result = await new CLI(engineMock([])).run(['status']);
  const formatter = new OutputFormatter();
  assert.match(formatter.format(result), /\[OK\] status/);
  assert.equal(formatter.format(result, { quiet: true }), '');
  assert.match(formatter.format(result, { mode: 'json' }), /"exitCode":0/);
  assert.match(formatter.format(result, { verbose: true }), /exitCode: 0/);
});

test('error and help formatters produce stable console output', () => {
  const error = new ErrorFormatter().format({
    command: 'workspace',
    message: 'Usage: framework workspace <path>',
    exitCode: 2,
    errorCode: 'INVALID_ARGUMENTS',
  });
  assert.match(error, /INVALID_ARGUMENTS/);
  assert.match(new HelpFormatter().format([]), /Framework Engine CLI/);
});

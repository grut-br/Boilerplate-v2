import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { ConfigurationError } from './ConfigurationErrors.ts';
import { ConfigurationLoader, loadConfiguration } from './ConfigurationLoader.ts';
import { DEFAULT_ENGINE_CONFIGURATION, mergeConfigurations } from './EngineConfiguration.ts';
import { resolveEnvironment } from './EnvironmentLoader.ts';
import { validateConfiguration } from './ConfigurationValidator.ts';

test('loads defaults without environment or config file', () => {
  const configuration = loadConfiguration({}, { cwd: os.tmpdir(), environment: {} });
  assert.deepEqual(configuration, DEFAULT_ENGINE_CONFIGURATION);
});

test('resolves supported environment variables with typed values', () => {
  const rawEnvironment = {
    OPENAI_API_KEY: 'env-key',
    OPENAI_MODEL: 'env-model',
    OPENAI_BASE_URL: 'https://env.test/v1',
    OPENAI_TIMEOUT: '1200',
    OPENAI_MAX_OUTPUT_TOKENS: '512',
    OPENAI_TEMPERATURE: '0.3',
    ENGINE_LOG_LEVEL: 'debug',
    ENGINE_DEBUG: 'true',
    ENGINE_CACHE: 'false',
  };
  const environment = resolveEnvironment(rawEnvironment);
  assert.equal(environment.openai?.timeout, 1200);
  const configuration = new ConfigurationLoader({ cwd: os.tmpdir(), environment: rawEnvironment }).loadConfiguration();
  assert.equal(configuration.openai.apiKey, 'env-key');
  assert.equal(configuration.openai.timeout, 1200);
  assert.equal(configuration.openai.maxOutputTokens, 512);
  assert.equal(configuration.openai.temperature, 0.3);
  assert.equal(configuration.logLevel, 'debug');
  assert.equal(configuration.debug, true);
  assert.equal(configuration.cache, false);
});

test('loads framework.config.json and applies runtime over file over environment', async () => {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'framework-config-'));
  try {
    await writeFile(path.join(cwd, 'framework.config.json'), JSON.stringify({
      openai: { model: 'file-model', timeout: 2000 },
      logLevel: 'warn',
    }), 'utf8');
    const configuration = new ConfigurationLoader({
      cwd,
      environment: { OPENAI_MODEL: 'env-model', OPENAI_TIMEOUT: '1000' },
    }).loadConfiguration({ openai: { model: 'runtime-model' }, debug: true });
    assert.equal(configuration.openai.model, 'runtime-model');
    assert.equal(configuration.openai.timeout, 2000);
    assert.equal(configuration.logLevel, 'warn');
    assert.equal(configuration.debug, true);
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

test('merges nested configuration without losing defaults', () => {
  const configuration = mergeConfigurations(
    { openai: { model: 'first', temperature: 0.2 } },
    { openai: { model: 'second' }, cache: false },
  );
  assert.equal(configuration.openai.model, 'second');
  assert.equal(configuration.openai.temperature, 0.2);
  assert.equal(configuration.openai.maxOutputTokens, DEFAULT_ENGINE_CONFIGURATION.openai.maxOutputTokens);
  assert.equal(configuration.cache, false);
});

test('rejects invalid configurations and malformed files', async () => {
  assert.throws(() => validateConfiguration(mergeConfigurations({ openai: { temperature: 3 } })), (error: unknown) => {
    return error instanceof ConfigurationError && error.code === 'INVALID_CONFIGURATION';
  });
  assert.throws(() => validateConfiguration(mergeConfigurations({ openai: { timeout: Number.NaN } })), (error: unknown) => {
    return error instanceof ConfigurationError && error.code === 'INVALID_CONFIGURATION';
  });

  const cwd = await mkdtemp(path.join(os.tmpdir(), 'framework-invalid-config-'));
  try {
    await mkdir(cwd, { recursive: true });
    await writeFile(path.join(cwd, 'framework.config.json'), '{invalid', 'utf8');
    assert.throws(() => new ConfigurationLoader({ cwd, environment: {} }).loadConfiguration(), (error: unknown) => {
      return error instanceof ConfigurationError && error.code === 'CONFIG_FILE_INVALID';
    });
  } finally {
    await rm(cwd, { recursive: true, force: true });
  }
});

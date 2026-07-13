import fs from 'node:fs';
import path from 'node:path';
import { ConfigurationError } from './ConfigurationErrors.ts';
import { EnvironmentLoader } from './EnvironmentLoader.ts';
import { mergeConfigurations, type ConfigurationInput, type EngineConfiguration } from './EngineConfiguration.ts';
import { validateConfiguration } from './ConfigurationValidator.ts';

export interface ConfigurationLoaderOptions {
  cwd?: string;
  fileName?: string;
  environment?: Record<string, string | undefined>;
}

export class ConfigurationLoader {
  private readonly cwd: string;
  private readonly fileName: string;
  private readonly environment: Record<string, string | undefined>;
  private readonly environmentLoader = new EnvironmentLoader();

  constructor(options: ConfigurationLoaderOptions = {}) {
    this.cwd = path.resolve(options.cwd ?? process.cwd());
    this.fileName = options.fileName ?? 'framework.config.json';
    this.environment = options.environment ?? process.env;
  }

  loadConfiguration(runtime: ConfigurationInput = {}): EngineConfiguration {
    const environment = this.environmentLoader.resolveEnvironment(this.environment);
    const file = this.loadFile();
    return validateConfiguration(mergeConfigurations(environment, file, runtime));
  }

  loadFile(): ConfigurationInput {
    const filePath = path.join(this.cwd, this.fileName);
    if (!fs.existsSync(filePath)) return {};
    try {
      const parsed: unknown = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('Configuration root must be an object.');
      }
      return parsed as ConfigurationInput;
    } catch (error) {
      throw new ConfigurationError('CONFIG_FILE_INVALID', `Unable to parse ${this.fileName}.`, {
        path: filePath,
        cause: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export function loadConfiguration(
  runtime: ConfigurationInput = {},
  options: ConfigurationLoaderOptions = {},
): EngineConfiguration {
  return new ConfigurationLoader(options).loadConfiguration(runtime);
}

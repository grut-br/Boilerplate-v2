import type { ConfigurationInput } from './EngineConfiguration.ts';
import { ConfigurationError } from './ConfigurationErrors.ts';

export class EnvironmentLoader {
  resolveEnvironment(environment: Record<string, string | undefined> = process.env): ConfigurationInput {
    const openai: ConfigurationInput['openai'] = {};
    this.setString(environment.OPENAI_API_KEY, (value) => { openai.apiKey = value; });
    this.setString(environment.OPENAI_MODEL, (value) => { openai.model = value; });
    this.setString(environment.OPENAI_BASE_URL, (value) => { openai.baseUrl = value; });
    this.setNumber(environment.OPENAI_TIMEOUT, (value) => { openai.timeout = value; });
    this.setNumber(environment.OPENAI_MAX_OUTPUT_TOKENS, (value) => { openai.maxOutputTokens = value; });
    this.setNumber(environment.OPENAI_TEMPERATURE, (value) => { openai.temperature = value; });

    const result: ConfigurationInput = {
      openai,
    };
    this.setString(environment.ENGINE_LOG_LEVEL, (value) => {
      result.logLevel = value as ConfigurationInput['logLevel'];
    });
    this.setBoolean(environment.ENGINE_DEBUG, (value) => { result.debug = value; });
    this.setBoolean(environment.ENGINE_CACHE, (value) => { result.cache = value; });
    return result;
  }

  private setString(value: string | undefined, setter: (value: string) => void): void {
    if (value !== undefined && value !== '') setter(value);
  }

  private setNumber(value: string | undefined, setter: (value: number) => void): void {
    if (value !== undefined && value !== '') setter(Number(value));
  }

  private setBoolean(value: string | undefined, setter: (value: boolean) => void): void {
    if (value === undefined || value === '') return;
    if (!['true', 'false', '1', '0'].includes(value)) {
      throw new ConfigurationError('INVALID_ENVIRONMENT_VALUE', `Invalid boolean environment value: ${value}`);
    }
    setter(value === 'true' || value === '1');
  }
}

export function resolveEnvironment(environment?: Record<string, string | undefined>): ConfigurationInput {
  return new EnvironmentLoader().resolveEnvironment(environment);
}

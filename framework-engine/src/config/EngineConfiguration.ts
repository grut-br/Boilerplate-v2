export type EngineLogLevel = 'silent' | 'error' | 'warn' | 'info' | 'debug';

export interface OpenAIEngineConfiguration {
  apiKey?: string;
  model: string;
  baseUrl: string;
  timeout: number;
  maxOutputTokens: number;
  temperature: number;
  maxRetries: number;
  retryDelayMs: number;
}

export interface EngineConfiguration {
  openai: OpenAIEngineConfiguration;
  logLevel: EngineLogLevel;
  debug: boolean;
  cache: boolean;
}

export type ConfigurationInput = {
  openai?: Partial<OpenAIEngineConfiguration>;
  logLevel?: EngineLogLevel;
  debug?: boolean;
  cache?: boolean;
};

export const DEFAULT_ENGINE_CONFIGURATION: EngineConfiguration = {
  openai: {
    model: 'gpt-4.1-mini',
    baseUrl: 'https://api.openai.com/v1',
    timeout: 30_000,
    maxOutputTokens: 2048,
    temperature: 0.7,
    maxRetries: 2,
    retryDelayMs: 100,
  },
  logLevel: 'info',
  debug: false,
  cache: true,
};

export function mergeConfigurations(...sources: ConfigurationInput[]): EngineConfiguration {
  let result: EngineConfiguration = {
    ...DEFAULT_ENGINE_CONFIGURATION,
    openai: { ...DEFAULT_ENGINE_CONFIGURATION.openai },
  };
  for (const source of sources) {
    result = {
      ...result,
      ...source,
      openai: { ...result.openai, ...(source.openai ?? {}) },
    };
  }
  return result;
}

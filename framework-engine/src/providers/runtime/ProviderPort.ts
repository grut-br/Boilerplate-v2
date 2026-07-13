import type { ProviderExecutionContext, ProviderRequest } from './ProviderRequest.ts';
import type { ProviderResponse } from './ProviderResponse.ts';

export interface ProviderCapabilities {
  streaming: boolean;
  supportsTemperature: boolean;
  supportsMaxTokens: boolean;
}

export interface ProviderConfiguration {
  id: string;
  type: string;
  options?: Record<string, unknown>;
}

export interface ProviderPort {
  readonly id: string;
  readonly configuration: ProviderConfiguration;
  capabilities(): ProviderCapabilities;
  execute(request: ProviderRequest, context: ProviderExecutionContext): Promise<ProviderResponse>;
}

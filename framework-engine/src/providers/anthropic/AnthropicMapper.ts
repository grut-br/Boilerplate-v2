import type { ProviderRequest } from '../runtime/ProviderRequest.ts';
import type { AnthropicConfiguration } from './AnthropicConfiguration.ts';

export interface AnthropicMessagesRequest {
  model: string;
  max_tokens: number;
  messages: Array<{ role: 'user'; content: string }>;
  system?: string;
  temperature?: number;
}

export class AnthropicMapper {
  toRequest(request: ProviderRequest, configuration: AnthropicConfiguration): AnthropicMessagesRequest {
    return {
      model: request.model ?? configuration.model,
      max_tokens: request.maxTokens ?? configuration.maxOutputTokens,
      messages: [{ role: 'user', content: request.prompt }],
      ...(request.systemPrompt ? { system: request.systemPrompt } : {}),
      ...(request.temperature ?? configuration.temperature) !== undefined
        ? { temperature: request.temperature ?? configuration.temperature }
        : {},
    };
  }
}

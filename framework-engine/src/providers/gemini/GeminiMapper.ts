import type { ProviderRequest } from '../runtime/ProviderRequest.ts';
import type { GeminiConfiguration } from './GeminiConfiguration.ts';

export interface GeminiGenerateContentRequest {
  contents: Array<{ role: 'user'; parts: Array<{ text: string }> }>;
  systemInstruction?: { parts: Array<{ text: string }> };
  generationConfig: {
    temperature?: number;
    maxOutputTokens?: number;
  };
}

export class GeminiMapper {
  toRequest(request: ProviderRequest, configuration: GeminiConfiguration): GeminiGenerateContentRequest {
    return {
      contents: [{ role: 'user', parts: [{ text: request.prompt }] }],
      ...(request.systemPrompt ? { systemInstruction: { parts: [{ text: request.systemPrompt }] } } : {}),
      generationConfig: {
        temperature: request.temperature ?? configuration.temperature,
        maxOutputTokens: request.maxTokens ?? configuration.maxOutputTokens,
      },
    };
  }

  endpoint(configuration: GeminiConfiguration): string {
    return `${configuration.baseUrl}/${encodeURIComponent(configuration.model)}:generateContent?key=${encodeURIComponent(configuration.apiKey ?? '')}`;
  }
}

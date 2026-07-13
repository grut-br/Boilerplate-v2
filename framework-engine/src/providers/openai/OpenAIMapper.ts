import type { HydratedContext } from '../../runtime/context/types.ts';
import type { ProviderRequest } from '../runtime/ProviderRequest.ts';
import type { OpenAIConfiguration } from './OpenAIConfiguration.ts';

export interface OpenAIResponsesRequest {
  model: string;
  input: string;
  instructions?: string;
  temperature?: number;
  max_output_tokens?: number;
}

export class OpenAIMapper {
  toRequest(request: ProviderRequest, configuration: OpenAIConfiguration): OpenAIResponsesRequest {
    return {
      model: request.model ?? configuration.model,
      input: request.prompt,
      ...(request.systemPrompt ? { instructions: request.systemPrompt } : {}),
      temperature: request.temperature ?? configuration.temperature,
      max_output_tokens: request.maxTokens ?? configuration.maxOutputTokens,
    };
  }

  fromContext(context: HydratedContext, configuration: OpenAIConfiguration): OpenAIResponsesRequest {
    return this.toRequest({
      prompt: context.sections.finalPayload,
      systemPrompt: context.sections.systemPrompt,
    }, configuration);
  }
}

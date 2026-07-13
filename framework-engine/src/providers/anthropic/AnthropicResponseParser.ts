import type { ProviderResponse } from '../runtime/ProviderResponse.ts';
import { AnthropicErrorMapper } from './AnthropicErrorMapper.ts';

export class AnthropicResponseParser {
  private readonly errors = new AnthropicErrorMapper();

  parse(payload: unknown, requestId: string, durationMs = 0): ProviderResponse {
    if (!payload || typeof payload !== 'object') {
      throw this.errors.invalidResponse('Anthropic response must be an object.');
    }
    const response = payload as Record<string, unknown>;
    const content = Array.isArray(response.content)
      ? response.content
        .filter((block) => block && typeof block === 'object'
          && (block as Record<string, unknown>).type === 'text'
          && typeof (block as Record<string, unknown>).text === 'string')
        .map((block) => (block as Record<string, unknown>).text as string)
        .join('')
      : '';
    if (!content) throw this.errors.invalidResponse();

    const usage = response.usage && typeof response.usage === 'object'
      ? response.usage as Record<string, unknown>
      : {};
    const promptTokens = this.number(usage.input_tokens);
    const completionTokens = this.number(usage.output_tokens);
    return {
      content,
      provider: 'anthropic',
      requestId,
      responseId: typeof response.id === 'string' ? response.id : undefined,
      model: typeof response.model === 'string' ? response.model : undefined,
      finishReason: typeof response.stop_reason === 'string' ? response.stop_reason : undefined,
      durationMs,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: promptTokens + completionTokens,
      },
    };
  }

  private number(value: unknown): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }
}

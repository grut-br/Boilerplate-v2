import { ProviderError } from '../runtime/ProviderErrors.ts';
import type { ProviderResponse } from '../runtime/ProviderResponse.ts';

export class OpenAIResponseParser {
  parse(payload: unknown, requestId: string, durationMs = 0): ProviderResponse {
    if (!payload || typeof payload !== 'object') {
      throw new ProviderError('OPENAI_INVALID_RESPONSE', 'OpenAI response must be an object.');
    }
    const response = payload as Record<string, unknown>;
    const content = this.extractText(response);
    if (content === undefined) {
      throw new ProviderError('OPENAI_INVALID_RESPONSE', 'OpenAI response did not contain output text.');
    }
    const usage = response.usage && typeof response.usage === 'object'
      ? response.usage as Record<string, unknown>
      : {};
    const promptTokens = this.number(usage.input_tokens);
    const completionTokens = this.number(usage.output_tokens);
    const finishReason = this.finishReason(response);
    return {
      content,
      provider: 'openai',
      requestId,
      responseId: typeof response.id === 'string' ? response.id : undefined,
      model: typeof response.model === 'string' ? response.model : undefined,
      finishReason,
      durationMs,
      usage: {
        promptTokens,
        completionTokens,
        totalTokens: this.number(usage.total_tokens, promptTokens + completionTokens),
      },
    };
  }

  private extractText(response: Record<string, unknown>): string | undefined {
    if (typeof response.output_text === 'string') {
      return response.output_text;
    }
    if (!Array.isArray(response.output)) {
      return undefined;
    }
    const texts: string[] = [];
    for (const item of response.output) {
      if (!item || typeof item !== 'object') continue;
      const content = (item as Record<string, unknown>).content;
      if (!Array.isArray(content)) continue;
      for (const part of content) {
        if (part && typeof part === 'object' && typeof (part as Record<string, unknown>).text === 'string') {
          texts.push((part as Record<string, unknown>).text as string);
        }
      }
    }
    return texts.length > 0 ? texts.join('') : undefined;
  }

  private finishReason(response: Record<string, unknown>): string | undefined {
    if (response.incomplete_details && typeof response.incomplete_details === 'object') {
      const reason = (response.incomplete_details as Record<string, unknown>).reason;
      if (typeof reason === 'string') return reason;
    }
    if (typeof response.status === 'string') {
      return response.status === 'completed' ? 'stop' : response.status;
    }
    return undefined;
  }

  private number(value: unknown, fallback = 0): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }
}

import type { ProviderResponse } from '../runtime/ProviderResponse.ts';
import { GeminiErrorMapper } from './GeminiErrorMapper.ts';

export class GeminiResponseParser {
  private readonly errors = new GeminiErrorMapper();

  parse(payload: unknown, requestId: string, model: string, durationMs = 0): ProviderResponse {
    if (!payload || typeof payload !== 'object') {
      throw this.errors.invalidResponse('Gemini response must be an object.');
    }
    const response = payload as Record<string, unknown>;
    const candidates = Array.isArray(response.candidates) ? response.candidates : [];
    const first = candidates[0];
    const content = first && typeof first === 'object' ? (first as Record<string, unknown>).content : undefined;
    const parts = content && typeof content === 'object' ? (content as Record<string, unknown>).parts : undefined;
    const text = Array.isArray(parts)
      ? parts.filter((part) => part && typeof part === 'object' && typeof (part as Record<string, unknown>).text === 'string')
        .map((part) => (part as Record<string, unknown>).text as string).join('')
      : '';
    if (!text) throw this.errors.invalidResponse();

    const usage = response.usageMetadata && typeof response.usageMetadata === 'object'
      ? response.usageMetadata as Record<string, unknown>
      : {};
    const finishReason = first && typeof first === 'object' && typeof (first as Record<string, unknown>).finishReason === 'string'
      ? (first as Record<string, unknown>).finishReason as string
      : undefined;
    const inputTokens = this.number(usage.promptTokenCount);
    const outputTokens = this.number(usage.candidatesTokenCount);
    return {
      content: text,
      provider: 'gemini',
      requestId,
      responseId: typeof response.responseId === 'string' ? response.responseId : undefined,
      model: typeof response.modelVersion === 'string' ? response.modelVersion : model,
      finishReason,
      durationMs,
      usage: {
        promptTokens: inputTokens,
        completionTokens: outputTokens,
        totalTokens: this.number(usage.totalTokenCount, inputTokens + outputTokens),
      },
    };
  }

  private number(value: unknown, fallback = 0): number {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  }
}

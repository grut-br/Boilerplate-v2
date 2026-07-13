import type { ProviderRequest } from './ProviderRequest.ts';
import type { ProviderResult } from './ProviderResponse.ts';

export interface PipelineResult extends ProviderResult {
  pipelineId: string;
  request: Pick<ProviderRequest, 'providerId' | 'model'>;
  startedAt: number;
  completedAt: number;
}

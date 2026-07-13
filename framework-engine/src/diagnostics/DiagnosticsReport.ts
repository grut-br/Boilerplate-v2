import type { DiagnosticsSnapshot } from './DiagnosticsSnapshot.ts';

export class DiagnosticsReport {
  private readonly snapshot: DiagnosticsSnapshot;

  constructor(snapshot: DiagnosticsSnapshot) {
    this.snapshot = snapshot;
  }

  toJSON(): string {
    return JSON.stringify(this.snapshot, null, 2);
  }

  toMarkdown(): string {
    const { trace, metrics } = this.snapshot;
    const lines: string[] = [];

    lines.push(`# Execution Diagnostics Report - ${trace.executionId}`);
    lines.push('');
    lines.push('## Metrics');
    lines.push(`- **Total Duration**: ${metrics.totalDurationMs}ms`);
    lines.push(`- **Provider**: ${metrics.provider ?? 'N/A'}`);
    lines.push(`- **Model**: ${metrics.model ?? 'N/A'}`);
    lines.push(`- **Estimated Prompt Tokens**: ${metrics.estimatedPromptTokens}`);
    lines.push(`- **Estimated Completion Tokens**: ${metrics.estimatedCompletionTokens}`);
    lines.push(`- **Returned Tokens**: ${metrics.returnedTokens}`);
    lines.push(`- **Prompt Size**: ${metrics.promptSize} chars`);
    lines.push(`- **Response Size**: ${metrics.responseSize} chars`);
    lines.push(`- **Hydrated Documents**: ${metrics.hydratedDocuments}`);
    lines.push(`- **Cache Status**: ${metrics.cache}`);
    lines.push(`- **Retries**: ${metrics.retries}`);
    lines.push(`- **Timeout**: ${metrics.timeout ? 'Yes' : 'No'}`);
    lines.push('');

    lines.push('## Stage Durations');
    for (const [stage, duration] of Object.entries(metrics.stageDurations)) {
      lines.push(`- **${stage}**: ${duration}ms`);
    }
    lines.push('');

    lines.push('## Execution Trace');
    lines.push('| Stage | Duration | Status |');
    lines.push('| --- | --- | --- |');
    for (const span of trace.spans) {
      const status = span.completedAt !== undefined ? 'Completed' : 'In Progress';
      const duration = span.durationMs !== undefined ? `${span.durationMs}ms` : 'N/A';
      lines.push(`| ${span.stage} | ${duration} | ${status} |`);
    }

    return lines.join('\n');
  }

  toConsoleString(): string {
    const { trace, metrics } = this.snapshot;
    const lines: string[] = [];

    lines.push(`[DIAGNOSTICS] Execution: ${trace.executionId}`);
    lines.push(`  Duration: ${metrics.totalDurationMs}ms`);
    lines.push(`  Provider: ${metrics.provider ?? 'N/A'} (${metrics.model ?? 'N/A'})`);
    lines.push(`  Tokens: Prompt (est: ${metrics.estimatedPromptTokens}, real: ${metrics.promptTokens}) | Completion: ${metrics.completionTokens}`);
    lines.push(`  Documents Hydrated: ${metrics.hydratedDocuments} | Cache: ${metrics.cache}`);
    lines.push(`  Retries: ${metrics.retries} | Timeout: ${metrics.timeout}`);
    lines.push(`  Trace Spans:`);
    for (const span of trace.spans) {
      const duration = span.durationMs !== undefined ? `${span.durationMs}ms` : 'pending';
      lines.push(`    - ${span.stage}: ${duration}`);
    }

    return lines.join('\n');
  }
}

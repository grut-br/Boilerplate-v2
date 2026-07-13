# Framework Engine Public API

All exports are available from `src/index.ts`.

## Runtime

- `ProviderPort`: provider adapter contract with `id`, `configuration`, `capabilities()` and `execute()`.
- `ProviderRegistry`: registers providers, resolves a provider and selects a default.
- `ProviderExecutor`: executes provider requests, hydrated contexts and pipeline results.
- `ProviderRequest`, `ProviderResponse`, `ProviderResult`: neutral request and result contracts.

## Providers

- `MockProvider`: deterministic local provider.
- `OpenAIProvider` and `registerOpenAIProvider()`.
- `GeminiProvider` and `registerGeminiProvider()`.
- `AnthropicProvider` and `registerAnthropicProvider()`.

Each adapter exports its configuration, mapper, error mapper and response parser from its provider directory. Adapter configuration may be passed explicitly or loaded from its supported environment variables.

## Context

- `MarkdownLoader`: discovers and loads framework documents.
- `ContextResolver`: resolves documents for a work unit.
- `ContextHydrator`: applies document ordering and token budgets.
- `HydratedContext`: stable context object consumed by `ProviderExecutor`.

## Diagnostics

```ts
import {
  DiagnosticsCollector,
  EngineLogger,
  ExecutionTrace,
  LogLevel,
  PerformanceTimer,
  DiagnosticsSnapshot,
  DiagnosticsReport,
} from './src/index.ts';

const diagnostics = new DiagnosticsCollector(new EngineLogger({ level: LogLevel.INFO }));
diagnostics.start({ executionId: 'request-1' });
diagnostics.startStage('Bootstrap');
diagnostics.endStage('Bootstrap');
diagnostics.recordMetrics({ provider: 'mock', hydratedDocuments: 2, cache: 'hit' });
const snapshot = diagnostics.finish();

// Generate human-readable reports from snapshots
const report = new DiagnosticsReport(snapshot);
console.log(report.toConsoleString());
```

`ExecutionTrace` records the canonical stages in order: `Bootstrap`, `Context Resolution`, `Markdown Loader`, `Hydration`, `Prompt Assembly`, `Provider Execution`, `Response Parsing`, `Pipeline Result`, and `Completed`.

`ExecutionMetrics` exposes total and stage durations, provider, model, estimated and returned tokens, prompt and response sizes, hydrated document count, cache status, retries and timeout state. `ExecutionMetrics.fromProviderResult()` maps the neutral provider result into these fields.

`DiagnosticsSnapshot` contains the complete `ExecutionTraceSnapshot` and `ExecutionMetrics` object.

`DiagnosticsReport` produces structured JSON (`toJSON()`), Markdown summaries (`toMarkdown()`), and human-readable console outputs (`toConsoleString()`) from any snapshot.

`EngineLogger` emits structured `LogEntry` values through an injectable sink. `SILENT` disables all output, which is the default used by diagnostics collectors and benchmarks.

## Compatibility

Diagnostics is intentionally additive. It does not modify `ProviderExecutor`, Pipeline, context hydration or existing provider implementations. Integrators can instrument an execution boundary by recording stage events around their existing calls.

# Framework Engine V3.1

Framework Engine is a provider-agnostic execution runtime for hydrated work-unit context and LLM adapters.

## Release Candidate

**Version:** V3.1  
**Status:** RELEASE CANDIDATE  
**Architecture:** FROZEN  
**Next:** V4

V3.1 includes the loader, context hydration, provider registry and three official adapters: Mock, OpenAI and Gemini, plus the Anthropic adapter. Provider-specific behavior remains isolated in its adapter directory. The execution engine, pipeline, runtime contracts and `ProviderExecutor` are unchanged by provider additions.

## Public API

The public entrypoint is `src/index.ts`. It exports runtime contracts, context hydration, provider adapters and diagnostics. See [`API.md`](./API.md) for the public API reference.

## Diagnostics

The standalone diagnostics layer provides:

- `EngineLogger` with TRACE, DEBUG, INFO, WARN, ERROR and SILENT levels.
- `PerformanceTimer` for monotonic duration measurements.
- `ExecutionTrace` for Bootstrap, Context Resolution, Markdown Loader, Hydration, Prompt Assembly, Provider Execution, Response Parsing, Pipeline Result, and Completed stages.
- `ExecutionMetrics` for duration, provider/model, tokens, sizes, hydrated documents, cache, retries and timeout data.
- `DiagnosticsCollector` to combine a trace and metrics snapshot without coupling to the engine core.

## Benchmark

Run the deterministic benchmark from the repository root:

```text
node --experimental-strip-types framework-engine/examples/benchmark.ts
```

It executes ten Mock runs and ten OpenAI adapter runs. The OpenAI sample uses a local mocked response, so no API key or network request is required. The output includes average, minimum, maximum and standard deviation in milliseconds.

## Validation

```text
npm run test
npm run build
npm run typecheck
```

V3.1 is frozen. New architectural contracts and cross-cutting changes are scheduled for V4.

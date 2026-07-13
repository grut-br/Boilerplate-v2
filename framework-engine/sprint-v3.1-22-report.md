# Sprint V3.1-22 - OpenAI Runtime Execution

## Architecture

The existing provider abstraction was preserved. The OpenAI adapter uses only the native `fetch` API and implements `ProviderPort` without adding an OpenAI SDK or dependencies for other vendors.

```text
HydratedContext
  -> ProviderExecutor.executeContextPipeline()
  -> ProviderRegistry
  -> OpenAIProvider.execute()
  -> POST /v1/responses
  -> OpenAIResponseParser
  -> ProviderResponse
  -> PipelineResult
```

## Files Created

- `examples/openai-example.ts`
- `src/providers/runtime/PipelineResult.ts`
- `sprint-v3.1-22-report.md`

## Files Modified

- `src/providers/runtime/ProviderExecutor.ts`
- `src/providers/runtime/index.ts`

The OpenAI adapter from Sprint V3.1-21 remains the concrete HTTP implementation. No existing Markdown, capability, workspace, or Boilerplate file was changed.

## Execution Flow

1. `HydratedContext.sections.finalPayload` is passed to `ProviderExecutor`.
2. The executor resolves the configured provider from `ProviderRegistry`.
3. `OpenAIProvider` builds a Responses API request with `model`, `input`, `instructions`, `temperature`, and `max_output_tokens`.
4. Native `fetch` sends the request to `https://api.openai.com/v1/responses`.
5. Timeout and cancellation are enforced with `AbortController`.
6. Rate limit and 5xx responses use the configured retry policy.
7. `OpenAIResponseParser` maps text, usage, response ID, returned model, finish reason, and duration to `ProviderResponse`.
8. `ProviderExecutor` wraps the provider result as `PipelineResult`.

## Metrics

The result reports duration, estimated prompt tokens, prompt size, response size, provider, response ID, returned model, finish reason, and input/output token usage when supplied by the API.

## Configuration

- `OPENAI_API_KEY` is required for a real request.
- `OPENAI_MODEL` optionally selects the model.
- `OPENAI_BASE_URL` can override the endpoint for controlled environments.
- Timeout, retry count, retry delay, temperature, and output token limits are configurable through `OpenAIConfiguration`.

Run the example from `framework-engine/` with:

```text
node --experimental-strip-types examples/openai-example.ts
```

Without `OPENAI_API_KEY`, the example prints a friendly message and exits successfully without making a request.

## Tests and Validation

- `npm run test`: passed, 8 CLI tests.
- OpenAI adapter tests: passed, 9 tests using mocked HTTP responses.
- Full regression suite: passed, 36 tests.
- `npm run typecheck`: passed.
- `npm run build`: passed.

No test performs a real network request.

## Known Limitations

- A real API-key execution is intentionally not triggered during local validation.
- Streaming Responses API is not implemented.
- The current checkout has no central `Engine` class; `executeContextPipeline()` is the integration entry point for the existing runtime layers.
- Retry policy is intentionally basic and does not yet honor server-provided rate-limit reset headers.

## Sprint V3.1-23 Next Steps

- Add production retry/backoff policy based on response headers.
- Add streaming support if the provider contract is extended.
- Connect the pipeline result to the eventual central Engine lifecycle and CLI execution command.
- Add secure operational logging and request correlation persistence.

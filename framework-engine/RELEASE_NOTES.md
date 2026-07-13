# Framework Engine V3.1 Release Candidate

## Status

**FRAMEWORK ENGINE V3.1**  
**STATUS: RELEASE CANDIDATE**  
**ARCHITECTURE: FROZEN**  
**READY FOR V4**

V3.1 completes the provider-neutral runtime with three official LLM adapters and an additive operational diagnostics layer. The release candidate is intended for integration validation and stability testing before V4 planning begins.

## Included

- Mock, OpenAI, Gemini and Anthropic provider adapters using the common `ProviderPort`.
- Structured engine logging with six operational levels.
- Execution metrics for duration, stages, provider/model, tokens, payload sizes, hydration, cache, retries and timeout.
- Canonical Pipeline -> Hydration -> Provider -> Response -> Result -> Finished trace.
- Deterministic benchmark with ten Mock and ten local OpenAI adapter executions.
- Public API documentation.

## Compatibility Guarantee

No Engine, Pipeline, Runtime, Context Hydration or `ProviderExecutor` changes are required to add a provider. Existing providers remain unchanged by the V3.1 observability work. Diagnostics is additive and can be adopted at execution boundaries.

## Validation

- Test suite: passing.
- Production build: passing.
- Typecheck: passing.
- Benchmark: passing without API credentials or external network calls.

## V4 Candidates

See [`ROADMAP_V4.md`](./ROADMAP_V4.md). V4 work must begin from a new architecture decision; V3.1 contracts are frozen.

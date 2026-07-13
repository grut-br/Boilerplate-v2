# Sprint V3.1-23 - Centralized Engine Configuration

## Architecture

Configuration is now resolved by a provider-agnostic module under `src/config/`. Providers receive resolved values and no provider reads `process.env` directly.

```text
Runtime parameters
        |
framework.config.json
        |
EnvironmentLoader
        |
Internal defaults
        v
ConfigurationLoader
        v
ConfigurationValidator
        v
EngineConfiguration
        v
ProviderExecutor / Provider adapters
```

The effective priority is:

```text
runtime parameters > framework.config.json > environment > defaults
```

## Files Created

- `src/config/EngineConfiguration.ts`
- `src/config/ConfigurationLoader.ts`
- `src/config/EnvironmentLoader.ts`
- `src/config/ConfigurationValidator.ts`
- `src/config/ConfigurationErrors.ts`
- `src/config/index.ts`
- `src/config/ConfigurationLoader.test.ts`
- `framework.config.example.json`
- `sprint-v3.1-23-report.md`

## Files Modified

- `src/index.ts`
- `src/providers/runtime/ProviderExecutor.ts`
- `src/providers/runtime/index.ts`
- `src/providers/runtime/ProviderExecutor.test.ts`
- `src/providers/openai/OpenAIConfiguration.ts`
- `src/providers/openai/index.ts`
- `examples/openai-example.ts`

No Boilerplate file, `.agents` file, `.ai-workspace` file, existing Markdown document, or Capability was modified.

## Configuration Resolution

`ConfigurationLoader.loadConfiguration()` combines the four sources in order. `EnvironmentLoader` is the only layer that reads process environment values. `mergeConfigurations()` performs a nested merge for the `openai` section, preserving unspecified defaults. `ConfigurationValidator` rejects invalid models, URLs, timeouts, token limits, temperatures, retry settings, log levels, and engine flags.

Supported environment variables:

- `OPENAI_API_KEY`
- `OPENAI_MODEL`
- `OPENAI_BASE_URL`
- `OPENAI_TIMEOUT`
- `OPENAI_MAX_OUTPUT_TOKENS`
- `OPENAI_TEMPERATURE`
- `ENGINE_LOG_LEVEL`
- `ENGINE_DEBUG`
- `ENGINE_CACHE`

## Integration

`ProviderExecutor` now accepts `EngineConfiguration` and uses `configuration.openai.timeout` as its default execution timeout. When no configuration is passed, it calls `loadConfiguration()` automatically, which provides the runtime bootstrap path.

`registerOpenAIProvider()` accepts the centralized `EngineConfiguration` and maps its OpenAI section to the provider adapter. `OpenAIConfiguration` no longer reads environment variables.

## Tests and Validation

- Configuration tests: 5 passing.
- OpenAI and ProviderExecutor tests: 17 passing.
- Full regression suite: 41 passing.
- `npm run test`: passed.
- `npm run typecheck`: passed.
- `npm run build`: passed.

The example was executed without `OPENAI_API_KEY`; it printed a friendly message and made no network request.

## Known Limitations

- The checkout still has no central `Engine` class; `ProviderExecutor` is the current bootstrap consumer.
- Configuration files are loaded from the current working directory only unless a loader path is supplied.
- Secrets are read into memory but are not persisted or logged.
- No provider-specific configuration modules for Gemini or Anthropic were added.

## Sprint V3.1-24 Next Steps

- Connect `EngineConfiguration` to a central Engine lifecycle/bootstrap object.
- Add configuration-aware CLI diagnostics without exposing secrets.
- Add schema versioning and migration rules for `framework.config.json`.
- Add secure secret providers and production observability settings.

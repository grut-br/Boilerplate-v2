# Changelog

## [3.1.0-rc.1] - 2026-07-12

### Added

- Anthropic Claude Messages API adapter as the third official provider.
- Structured logging with TRACE, DEBUG, INFO, WARN, ERROR and SILENT levels.
- Execution diagnostics collector, performance timer, execution metrics and canonical execution trace.
- Deterministic Mock and OpenAI adapter benchmark with summary statistics.
- Public API reference and release documentation.

### Frozen

- Engine execution architecture.
- Pipeline and context hydration contracts.
- ProviderExecutor behavior.
- Existing OpenAI, Gemini and Mock provider implementations.

## [3.0.0]

- Established the provider-neutral runtime, context hydration and execution contracts.

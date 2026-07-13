# Framework Engine V4 Roadmap

V3.1 is frozen as a release candidate. This roadmap lists candidate work only; it does not change the V3.1 contract.

## Provider Platform

- Optional streaming contract designed as a provider-neutral extension.
- Server-sent event and tool-use normalization after compatibility review.
- Provider capability negotiation beyond the current static capability set.
- Configurable retry policies with server-provided backoff headers.

## Operations

- Pluggable metrics exporters for logs, OpenTelemetry and time-series systems.
- Trace correlation across multiple pipeline executions.
- Redaction policies for prompts, responses and provider metadata.
- Persistent benchmark history and regression thresholds.

## Runtime

- Cancellation and timeout policy unification across all execution boundaries.
- Optional concurrent work-unit execution with explicit ordering guarantees.
- Cache provider-neutral context snapshots with invalidation semantics.
- Versioned public contracts and compatibility checks.

## Delivery Gates

1. Publish an architecture decision record for every new cross-cutting contract.
2. Preserve adapter isolation and provider-neutral execution semantics.
3. Add contract tests before changing frozen V3.1 interfaces.
4. Keep release validation independent of provider credentials.

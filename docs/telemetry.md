# Telemetry and Sentry integration

This app is wired up with Sentry via `sentry-expo` and includes:

- React Navigation routing instrumentation for automatic navigation spans
- Performance tracing and profiling (configurable sample rates)
- Global error handling and an in-app error boundary to capture exceptions

## Configuration

Environment variables in `.env` (or EAS secrets) control Sentry:

- SENTRY_DSN: Project DSN
- SENTRY_TRACES_SAMPLE_RATE: 0.0–1.0 (default 1.0 in dev)
- SENTRY_PROFILES_SAMPLE_RATE: 0.0–1.0 (default 1.0 in dev)

These are surfaced through `app.config.ts` -> `extra` and read in `src/lib/env.ts`.

## Initialization

Initialization happens in `src/lib/sentry.ts`:

- Creates a `ReactNavigationInstrumentation` instance and wires it to the `NavigationContainer` in `RootNavigator`
- Enables `ReactNativeTracing` with the above instrumentation
- Registers a global error handler that forwards crashes to Sentry (in addition to React Native's default handler)

`initSentry()` is called at module init in `src/App.tsx`.

## Error boundary

`<ErrorBoundary />` is used around the root navigator to catch rendering errors and report them to Sentry while presenting a user-friendly fallback.

## Testing

Jest is configured to stub `sentry-expo` in `jest.setup.ts` so tests do not require native modules or network access. See `src/test/sentry.test.ts`.

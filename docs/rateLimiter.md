# Rate Limiter

`RateLimiter` enforces concurrent execution limits and optional reservoir-based rate windows.

Options (see `WrapOptions.rateLimit`):

- `maxConcurrent` — maximum concurrent executions (default: 10).
- `reservoir` — optional token bucket count for the interval.
- `reservoirRefreshIntervalMs` — refill interval for the reservoir.
- `reservoirRefreshAmount` — amount added on each refill.

Events (monitor):

- `rate.acquire` — emitted when a slot is acquired, payload: `{ current }`.
- `rate.release` — emitted when a slot is released, payload: `{ current }`.
- `rate.queued` — when a job is queued, payload: `{ queueLength }`.
- `rate.refill` — when reservoir refills, payload: `{ reservoir }`.
- `rate.reservoir_exhausted` — when reservoir is depleted.

Usage example:

```ts
await wrap(() => fetch('/heavy'), { rateLimit: { maxConcurrent: 3 } });
```

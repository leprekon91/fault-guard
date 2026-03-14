# Circuit Breaker

`CircuitBreaker` implements a simple state machine with `CLOSED`, `OPEN`, and `HALF_OPEN` states.

Constructor signature: `new CircuitBreaker(failureThreshold = 5, successThreshold = 2, timeoutMs = 60000, monitor?)`

Options (see `WrapOptions.circuit`):

- `failureThreshold` — failures required to open the circuit.
- `successThreshold` — consecutive successes to close from `HALF_OPEN`.
- `timeoutMs` — how long `OPEN` lasts before trying `HALF_OPEN`.

Events (monitor):

- `circuit.failure` — emitted on every failure, payload: `{ failures }`.
- `circuit.success` — emitted on success, payload: `{ state, successes }`.
- `circuit.trip` — circuit opened, payload: `{ nextAttempt }`.
- `circuit.reset` — circuit reset to `CLOSED`.
- `circuit.half_open` — transition to `HALF_OPEN`.
- `circuit.reject` — a call rejected while `OPEN`.

Usage example:

```ts
import { CircuitBreaker } from '@leprekon-hub/fault-guard';

const cb = new CircuitBreaker(3, 2, 30000, (e) => console.log(e));
await cb.exec(() => fetch('/maybe-fails'));
```

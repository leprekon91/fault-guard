export type State = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export class CircuitBreaker {
  private failures = 0;
  private successes = 0;
  private state: State = 'CLOSED';
  private nextAttempt = 0;

  constructor(private failureThreshold = 5, private successThreshold = 2, private timeoutMs = 60000) {}

  public async exec<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() > this.nextAttempt) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit is open');
      }
    }

    try {
      const res = await fn();
      this.onSuccess();
      return res;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  private onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.successes++;
      if (this.successes >= this.successThreshold) {
        this.reset();
      }
    } else {
      this.reset();
    }
  }

  private onFailure() {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.trip();
    }
  }

  private trip() {
    this.state = 'OPEN';
    this.nextAttempt = Date.now() + this.timeoutMs;
    this.failures = 0;
    this.successes = 0;
  }

  private reset() {
    this.state = 'CLOSED';
    this.failures = 0;
    this.successes = 0;
  }
}

export function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export function calcExponentialDelay(attempt: number, base = 100, factor = 2, max = 10000) {
  const delay = Math.min(base * Math.pow(factor, attempt - 1), max);
  return Math.floor(delay);
}

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    exclude: [],
    globals: false,
    // keep short timeout for CI but allow tests to advance timers
    testTimeout: 5000
  }
});

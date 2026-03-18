import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      thresholds: { branches: 70, functions: 75 },
      exclude: ['**/*.po.ts'],
    },
    server: {
      deps: {
        inline: ['@luigi-project/client'],
      },
    },
  },
});

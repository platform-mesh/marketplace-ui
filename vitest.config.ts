import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    reporters: ['default', ['junit', { outputFile: 'TEST-frontend.xml' }]],
    coverage: {
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

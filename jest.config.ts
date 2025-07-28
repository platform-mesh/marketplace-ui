import type { Config } from 'jest';
import presets from 'jest-preset-angular/presets';

const presetConfig = presets.createCjsPreset();

const jestConfig: Config = {
  ...presetConfig,
  setupFilesAfterEnv: ['<rootDir>/test-setup.ts'],
  transformIgnorePatterns: ['/node_modules/?!@angular'],
  moduleNameMapper: {
    '^services/(.*)$': ['<rootDir>/src/app/services/$1'],
    '^models/(.*)$': ['<rootDir>/src/app/models/$1'],
    '^shared/(.*)$': ['<rootDir>/src/app/shared/$1'],
    '^state/(.*)$': ['<rootDir>/src/app/state/$1'],
  },
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 75,
    },
  },
  coveragePathIgnorePatterns: ['\\.po\\.ts$'],
  reporters: ['default', ['jest-junit', { outputName: 'TEST-frontend.xml' }]],
};

export default jestConfig;

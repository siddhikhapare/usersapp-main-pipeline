import type { Config } from 'jest';
import nextJest from 'next/jest.js';

// nextJest reads your next.config.js + .env files and configures
// the transformer automatically — handles TSX, CSS modules, images, fonts
// No Babel config needed; next/jest uses SWC (Next.js's own compiler)
const createJestConfig = nextJest({
  dir: './', // root of your Next.js app (where next.config.js lives)
});

const customJestConfig: Config = {
  // ── Environment ──────────────────────────────────────────────────────────
  // jsdom simulates the browser DOM inside Node — required for RTL
  testEnvironment: 'jsdom',

  // ── Setup ────────────────────────────────────────────────────────────────
  // Runs after the test framework is installed in the environment.
  // This is where @testing-library/jest-dom matchers are registered.
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // ── Which tests to run ────────────────────────────────────────────────────
  // Only picks up .test.ts and .test.tsx files inside src/
  // Deliberately excludes __tests__/frontend.integration.test.ts
  // (that runs separately via jest.integration.config.js against a live backend)
  testMatch: [
    '<rootDir>/src/**/*.test.ts',
    '<rootDir>/src/**/*.test.tsx',
  ],

  // ── Ignore paths ─────────────────────────────────────────────────────────
  testPathIgnorePatterns: [
    '<rootDir>/.next/',
    '<rootDir>/node_modules/',
    // '<rootDir>/__tests__/', // integration tests — excluded from unit runs
  ],

  // ── Module aliases ────────────────────────────────────────────────────────
  // Maps @/* to src/* so your import { foo } from '@/components/foo' works
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // ── Coverage ──────────────────────────────────────────────────────────────
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',    // barrel files — no logic to cover
  ],
  coverageDirectory: '/tmp/coverage',
  coverageProvider: 'v8',  // faster than babel coverage

  // ── Misc ─────────────────────────────────────────────────────────────────
  clearMocks: true, // auto-clear mock state between tests (no need for jest.clearAllMocks())
};

// createJestConfig wraps your config so next/jest can inject its own
// SWC transform, CSS/image stubs, and Next.js-specific module aliases
export default createJestConfig(customJestConfig);
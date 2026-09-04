/** @type {import('jest').Config} */
// Separate config for integration tests — uses plain CJS so it works without ts-node
// These tests hit a REAL backend (docker-compose) so:
//   - testEnvironment is 'node' (no DOM needed)
//   - testTimeout is 60s (backend health retry loop)
//   - NO coverage collection (integration coverage is noise)
const config = {
  testEnvironment: 'node',

  transform: {
    '^.+\\.(ts|tsx|js|jsx)$': ['@swc/jest'],
  },

  testMatch: [
    '<rootDir>/__tests__/**/*.test.ts',
    '<rootDir>/__tests__/**/*.test.js',
  ],

  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
  ],

  testTimeout: 60000,
  collectCoverage: false,
};

module.exports = config;
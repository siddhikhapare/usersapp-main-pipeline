/** @type {import('jest').Config} */
module.exports = {

  // ── Runtime environment ───────────────────────────────────────────────────
  // 'node' is required for Express + pg.
  // Default is 'node' in Jest 27+, but being explicit avoids surprises.
  testEnvironment: 'node',

  // ── Open handle management ────────────────────────────────────────────────
  // pg.Pool keeps a TCP socket open after tests finish.
  // forceExit:          kills the Jest process after all tests complete
  //                     even if open handles remain (pg pool, timers, etc.)
  // detectOpenHandles:  prints a stack trace identifying WHICH handle is open
  //                     so you know if pool.end() is missing in afterAll()
  forceExit: true,
  detectOpenHandles: true,

  // ── Timeout ───────────────────────────────────────────────────────────────
  // Unit tests finish in <100ms (all DB calls are mocked).
  // Integration tests need time for:
  //   • pg.Pool to open a real TCP connection to postgres
  //   • CREATE TABLE / INSERT / SELECT / DELETE to execute
  // One timeout covers both because jest.config.js applies globally.
  // 30 seconds is generous — actual queries take 5–50ms in CI.
  testTimeout: 30000,

  // ── Verbosity ─────────────────────────────────────────────────────────────
  // Prints every individual test name.
  // Makes it easy to see exactly which assertion failed.
  verbose: true,

  // ── Coverage ──────────────────────────────────────────────────────────────
  // collectCoverageFrom tells istanbul WHICH files to measure.
  // Without this, files that no test imports show as 100% by omission.
  collectCoverageFrom: [
    '*.js',
    '!jest.config.js',    // exclude config itself
    '!eslint.config.js',  // exclude eslint config
    // node_modules is always excluded automatically
  ],

  // Output formats:
  //   text  → printed to terminal after every run
  //   lcov  → generates coverage/lcov.info for Codecov, SonarQube etc.
  coverageReporters: ['text', 'lcov'],

  // ── File matching ─────────────────────────────────────────────────────────
  // Jest will only pick up files matching these globs.
  // The actual per-command filtering (unit vs integration) is done by the
  // filename argument in package.json scripts — not here.
  //
  //   npm run test:unit        → jest backend.test.js
  //   npm run test:integration → jest backend.integration.test.js
  //
  // jest treats the argument as a regex matched against the full file path:
  //   "backend.test.js" matches  backend.test.js            ✅
  //   "backend.test.js" does NOT match backend.integration.test.js
  //     because the regex needs "backend" + anyChar + "test.js" contiguously
  //     but integration has ".integration." between them         ✅
  testMatch: [
    '**/*.test.js',
    '**/*.integration.test.js',
  ],
};
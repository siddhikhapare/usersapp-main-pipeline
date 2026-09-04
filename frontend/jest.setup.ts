// ── 1. RTL matchers ──────────────────────────────────────────────────────────
// Adds toBeInTheDocument(), toHaveClass(), toHaveValue(), etc.
// Must be first so all tests can use these matchers.
import '@testing-library/jest-dom';

// ── 2. Next.js navigation mock ───────────────────────────────────────────────
// next/navigation throws when used outside a real Next.js context.
// Mock it globally so every component test that calls useRouter/usePathname works.
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// ── 3. axios mock ────────────────────────────────────────────────────────────
// Prevents real HTTP calls during unit tests.
// Individual test files can override with mockedAxios.get.mockResolvedValueOnce(...)
jest.mock('axios');

// ── 4. window.location ───────────────────────────────────────────────────────
// jsdom's location is read-only; redefine it so tests can set hostname/href.
// Object.defineProperty(window, 'location', {
//   value: {
//     hostname: 'localhost',
//     href: 'http://localhost:3000',
//     reload: jest.fn(),
//   },
//   writable: true,
// });
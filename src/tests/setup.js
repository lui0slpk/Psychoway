// Frontend test setup - Vitest + React Testing Library
import '@testing-library/jest-dom';

// localStorage funcional en memoria (real Map, no mocks)
const storage = new Map();
const localStorageMock = {
  getItem: (key) => (storage.has(key) ? storage.get(key) : null),
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
  clear: () => storage.clear(),
  key: (i) => Array.from(storage.keys())[i] || null,
  get length() {
    return storage.size;
  },
};
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
  configurable: true,
});

// Mock fetch
global.fetch = vi.fn();

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
}
global.IntersectionObserver = MockIntersectionObserver;

// Mock ResizeObserver
class MockResizeObserver {
  observe() { return null; }
  unobserve() { return null; }
  disconnect() { return null; }
}
global.ResizeObserver = MockResizeObserver;

// Mock window.matchMedia (usado por bootstrap / responsive)
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
}

beforeEach(() => {
  storage.clear();
  vi.restoreAllMocks();
  fetch.mockClear && fetch.mockClear();
});
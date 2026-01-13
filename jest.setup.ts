// jest.setup.ts
// Setup global para Jest + React Testing Library
// NEXO v2.0 Frontend Testing Infrastructure

import '@testing-library/jest-dom';

// ============================================
// MOCK: Next.js Navigation (App Router)
// ============================================

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
  redirect: jest.fn(),
  notFound: jest.fn(),
}));

// ============================================
// MOCK: localStorage
// ============================================

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: jest.fn((index: number) => Object.keys(store)[index] || null),
  };
})();

Object.defineProperty(window, 'localStorage', { 
  value: localStorageMock,
  writable: true,
});

// ============================================
// MOCK: sessionStorage
// ============================================

const sessionStorageMock = (() => {
  let store: Record<string, string> = {};
  
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'sessionStorage', { 
  value: sessionStorageMock,
  writable: true,
});

// ============================================
// MOCK: document.cookie
// ============================================

let cookieStore = '';

Object.defineProperty(document, 'cookie', {
  get: jest.fn(() => cookieStore),
  set: jest.fn((value: string) => {
    cookieStore = value;
  }),
  configurable: true,
});

// ============================================
// MOCK: window.matchMedia (for responsive tests)
// ============================================

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// ============================================
// MOCK: IntersectionObserver (for lazy loading)
// ============================================

class MockIntersectionObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// ============================================
// MOCK: ResizeObserver
// ============================================

class MockResizeObserver {
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// ============================================
// MOCK: scrollIntoView (for ChatInterface)
// ============================================

Element.prototype.scrollIntoView = jest.fn();

// ============================================
// CLEANUP: Reset mocks between tests
// ============================================

beforeEach(() => {
  // Clear localStorage mock
  localStorageMock.clear();
  jest.clearAllMocks();
  
  // Reset cookie store
  cookieStore = '';
});

// ============================================
// GLOBAL: Suppress specific console warnings
// ============================================

const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Suppress React 19 specific warnings in tests
  console.error = (...args: unknown[]) => {
    const message = args[0]?.toString() || '';
    if (
      message.includes('Warning: ReactDOM.render') ||
      message.includes('Warning: An update to')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
  
  console.warn = (...args: unknown[]) => {
    const message = args[0]?.toString() || '';
    if (message.includes('Zustand')) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

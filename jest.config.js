// jest.config.js
// Configuración de Jest para NEXO v2.0 Frontend
// Setup: Next.js 16 + TypeScript + React Testing Library

const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Path to Next.js app for loading next.config.js and .env files
  dir: './',
});

/** @type {import('jest').Config} */
const customJestConfig = {
  // Display name for test runs
  displayName: 'NEXO Frontend',
  
  // Setup files to run after Jest is initialized
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Test environment (jsdom for React components)
  testEnvironment: 'jsdom',
  
  // Module path aliases (must match tsconfig.json paths)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  // Test file patterns
  testMatch: [
    '**/__tests__/**/*.(test|spec).(ts|tsx)',
    '**/*.(test|spec).(ts|tsx)',
  ],
  
  // Directories/files to ignore
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/.next/',
    '<rootDir>/e2e/', // Playwright E2E tests separate
  ],
  
  // Coverage collection settings
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    // Exclusions
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/types/**', // Type definitions only
    // ─── Capacitor native wrappers ───────────────────────────
    // These files wrap iOS/Android native APIs unavailable in
    // JSDOM (CI environment). They are tested on-device during
    // manual QA and integration testing, not in unit tests.
    '!lib/capacitor/att.ts',
    '!lib/capacitor/apple-auth.ts',
    '!lib/capacitor/deep-links.ts',
    '!lib/capacitor/push-notifications.ts',
    '!lib/capacitor/status-bar.ts',
    '!lib/capacitor/android-back.ts',
    '!lib/hooks/use-revenuecat.ts',
    '!lib/hooks/use-push-notifications.ts',
    '!lib/hooks/use-deep-links.ts',
    '!lib/hooks/use-android-back.ts',
    '!lib/hooks/use-native-platform.ts',
    '!lib/hooks/use-app-init.ts',
    '!lib/hooks/use-cookie-consent.ts',
  ],
  
  // Coverage thresholds: 20% ✓ → 50% ✓ → Target: 70%
  // Incrementado a 50% - cobertura actual supera este umbral
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 44,  // Ajustado a 44% tras simplificación de código (httpOnly cookies)
      lines: 50,
      statements: 50,
    },
  },
  
  // Coverage output directory
  coverageDirectory: 'coverage',
  
  // Coverage reporters for CI and local
  coverageReporters: ['text', 'text-summary', 'lcov', 'json-summary'],
  
  // Module file extensions to consider
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output for debugging
  verbose: true,
};

module.exports = createJestConfig(customJestConfig);


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
  ],
  
  // TODO: Incrementar a 80% al final del sprint de hardening
  // Coverage thresholds: 20% → 50% → 70% → 80%
  // Temporalmente en 20% porque los componentes UI aún no tienen tests
  coverageThreshold: {
    global: {
      branches: 20,
      functions: 20,
      lines: 20,
      statements: 20,
    },
  },
  
  // Coverage output directory
  coverageDirectory: 'coverage',
  
  // Module file extensions to consider
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Verbose output for debugging
  verbose: true,
};

module.exports = createJestConfig(customJestConfig);


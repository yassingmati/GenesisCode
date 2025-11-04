module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.js', '**/?(*.)+(spec|test).js'],
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/**/*.test.js',
    '!src/index.js',
    '!src/config/**',
    '!src/scripts/**',
    '!src/utils/seed*.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  globalTeardown: '<rootDir>/tests/teardown.js',
  testTimeout: 60000,
  verbose: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
};


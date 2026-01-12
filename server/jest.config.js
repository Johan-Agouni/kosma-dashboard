module.exports = {
    testEnvironment: 'node',
    testMatch: ['**/tests/**/*.test.js'],
    collectCoverageFrom: ['src/**/*.js', '!src/server.js'],
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            branches: 20,
            functions: 20,
            lines: 40,
            statements: 40,
        },
    },
    testTimeout: 30000,
};

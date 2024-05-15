/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */
import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    transform: {
        '^.+\\.ts?$': 'esbuild-jest',
    },
    clearMocks: true,
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    testMatch: ['**/?(*.)+(test).ts'],
};

export default config;

import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    rootDir: '.',
    preset: 'ts-jest',
    collectCoverage: true,
    testEnvironment: 'jsdom',
};

export default config;

import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    rootDir: '.',
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
};

export default config;

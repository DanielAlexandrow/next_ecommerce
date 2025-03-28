/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import viteConfig from './vite.config';

export default defineConfig(config => {
    return mergeConfig(
        viteConfig,
        {
            plugins: [react()],
            test: {
                globals: true,
                environment: 'jsdom',
                setupFiles: [
                    './resources/js/tests/setup.ts',
                    './tests/pact/setup.ts'
                ],
                include: [
                    'resources/js/**/*.{test,spec}.{js,jsx,ts,tsx}',
                    'resources/js/**/__tests__/**/*.{js,jsx,ts,tsx}',
                    'tests/pact/**/*.{test,spec}.{js,jsx,ts,tsx}'
                ],
                coverage: {
                    enabled: process.env.COVERAGE === 'true', // Only run coverage when explicitly requested
                    provider: 'v8',
                    reporter: ['text', 'json', 'html'],
                    exclude: [
                        'node_modules/',
                        'tests/setup.ts',
                    ],
                },
                poolOptions: {
                    threads: {
                        singleThread: true,
                        maxThreads: 2,
                        minThreads: 1
                    }
                },
                maxConcurrency: 10,
                testTimeout: 15000,
                typecheck: false, // Disable typechecking during tests
                restoreMocks: true, // Automatically restore mocks
                mockReset: true, // Reset mocks before each test
                clearMocks: true  // Clear mock calls before each test
            },
            resolve: {
                alias: {
                    '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
                    '@/types': path.resolve(__dirname, './resources/js/types'),
                }
            }
        }
    );
});

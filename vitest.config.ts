/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'node:url';
import { mergeConfig } from 'vite';
import viteConfig from './vite.config';

export default mergeConfig(
    viteConfig,
    defineConfig({
        plugins: [react()],
        test: {
            globals: true,
            environment: 'jsdom',
            setupFiles: ['./resources/js/tests/setup.ts'],
            include: ['resources/js/**/*.{test,spec}.{js,jsx,ts,tsx}'],
            coverage: {
                provider: 'v8',
                reporter: ['text', 'json', 'html'],
                exclude: [
                    'node_modules/',
                    'tests/setup.ts',
                ],
            },
            poolOptions: {
                threads: {
                    singleThread: true
                }
            },
            maxConcurrency: 10,
            maxThreads: 2,
            minThreads: 1
        },
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./resources/js', import.meta.url)),
                '@/types': path.resolve(__dirname, './resources/js/types'),
            }
        }
    })
);
/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./vitest.setup.ts'],
        include: ['resources/js/**/*.{test,spec}.{ts,tsx}'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: [
                'node_modules/',
                'tests/setup.ts',
                '**/*.d.ts',
                '**/*.config.{js,ts}',
                '**/types/**',
            ],
        },
        reporters: ['verbose', 'html'],
        outputFile: {
            html: './test-results/html/index.html',
        },
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './resources/js'),
            '@/types': path.resolve(__dirname, './resources/js/types'),
        },
    }
}); 
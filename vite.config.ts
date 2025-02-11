import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import path from 'path';

export default defineConfig({
	plugins: [
		laravel({
			input: ['resources/css/app.css', 'resources/js/app.tsx'],
			refresh: true,
		}),
		react(),
		tsconfigPaths(),
	],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './resources/js'),
			'@/types': path.resolve(__dirname, './resources/js/types'),
		},
	},
	test: {
		globals: true,
		environment: 'jsdom',
		setupFiles: ['resources/js/tests/setup.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'html'],
			exclude: [
				'node_modules/',
				'tests/setup.ts',
			],
		},
	},
});
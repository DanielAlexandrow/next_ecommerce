import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './resources/js/tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 1,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    globalSetup: './resources/js/tests/e2e/auth.setup.ts',
    use: {
        baseURL: 'http://localhost:8000',
        trace: 'on-first-retry',
        actionTimeout: 10000,
        navigationTimeout: 10000,
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
        },
    ],
}); 
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './resources/js/tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: 'http://localhost:8000',
        trace: 'on-first-retry',
        storageState: 'playwright/.auth/user.json',
    },

    projects: [
        {
            name: 'setup',
            testMatch: /.*\.setup\.ts/,
        },
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            dependencies: ['setup'],
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
            dependencies: ['setup'],
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
            dependencies: ['setup'],
        },
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
            dependencies: ['setup'],
        },
        {
            name: 'Mobile Safari',
            use: { ...devices['iPhone 12'] },
            dependencies: ['setup'],
        },
    ],

    webServer: {
        command: 'php artisan serve',
        url: 'http://localhost:8000',
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
}); 
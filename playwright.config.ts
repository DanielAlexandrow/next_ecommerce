import { defineConfig, devices } from '@playwright/test';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Determine environment
const testEnv = process.env.TEST_ENV || 'local';

// Set up base URL based on environment
let baseURL = 'http://localhost:8000';
if (testEnv === 'devNational') {
  baseURL = process.env.DEV_NATIONAL_URL || 'http://localhost:8000';
}

console.log(`Using base URL: ${baseURL} for environment: ${testEnv}`);

export default defineConfig({
  testDir: './tests/playwright/',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL,
    actionTimeout: 10000,
    navigationTimeout: 30000,
    trace: 'on-first-retry',
    video: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  globalSetup: './tests/auth.setup.ts',
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'test-results/',
  webServer: {
    command: 'php artisan serve',
    url: 'http://localhost:8000',
    reuseExistingServer: !process.env.CI,
    timeout: 12000,
  },
});
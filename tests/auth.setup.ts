import { chromium, FullConfig } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get base URL from environment or use a default
const BASE_URL = process.env.APP_URL || 'http://localhost:8000';

// Ensure directory exists
function ensureDirectoryExists(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

async function globalSetup(config: FullConfig) {
  // Ensure the auth directory exists
  ensureDirectoryExists('playwright/.auth');
  
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log(`Using base URL: ${BASE_URL}`);

    // First navigate to the admin login page
    await page.goto(`${BASE_URL}/adminlogin`, { waitUntil: 'networkidle' });
    console.log('Successfully navigated to admin login page');

    // Take a screenshot of the login page
    await page.screenshot({ path: 'playwright/.auth/login-page.png' });

    // Fill in login form
    await page.fill('input[type="email"]', 'admin@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Click the remember me checkbox
    const rememberCheckbox = page.locator('#remember');
    if (await rememberCheckbox.isVisible()) {
      await rememberCheckbox.check();
    }

    // Debug: Take a screenshot before submitting
    await page.screenshot({ path: 'playwright/.auth/before-submit.png' });

    // Click login button
    await page.click('button[type="submit"]');

    // Wait for navigation and check for success
    try {
      await page.waitForNavigation({ timeout: 10000 });
      console.log('Navigation happened after login attempt');
    } catch (e) {
      console.log('No navigation occurred after login attempt');
    }

    // Take a screenshot after login attempt
    await page.screenshot({ path: 'playwright/.auth/after-login.png' });
    console.log('Post-login URL:', page.url());

    // Check for successful login - we expect to be redirected to /shop-settings after admin login
    const isLoggedIn = page.url().includes('shop-settings');

    if (!isLoggedIn) {
      throw new Error('Login failed - not redirected to shop-settings page');
    }

    console.log('Login successful. Storing auth state.');
    
    // Save storage state
    await context.storageState({ path: 'playwright/.auth/admin.json' });
    
    console.log('Auth state saved successfully');
  } catch (error) {
    console.error('Auth setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

export default globalSetup;
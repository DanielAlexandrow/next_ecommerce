import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get base URL from environment or use a default
const BASE_URL = process.env.APP_URL || 'http://localhost:8000';

test('Manual authentication test', async ({ page }) => {
  // Go to the admin login page instead of regular login page
  await page.goto(`${BASE_URL}/adminlogin`, {
    waitUntil: 'networkidle', 
    timeout: 30000
  });
  
  console.log('Current URL:', page.url());
  
  // Take a screenshot
  await page.screenshot({ path: 'auth-test-login-page.png' });
  
  // Check if form is present and has expected fields, using more specific selector
  await expect(page.locator('form:has(button:text("Log in"))')).toBeVisible();
  await expect(page.locator('input[name="email"]')).toBeVisible();
  await expect(page.locator('input[name="password"]')).toBeVisible();
  
  // Log the form details for debugging
  const formDetails = await page.evaluate(() => {
    const form = document.querySelector('form');
    if (!form) return 'No form found';
    return {
      action: form.action || 'No action specified',
      method: form.method || 'No method specified',
      inputs: Array.from(form.querySelectorAll('input')).map(i => ({
        name: i.name,
        type: i.type,
        id: i.id
      }))
    };
  });
  console.log('Form details:', formDetails);
  
  // Try to log in with admin credentials
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'password123');
  
  // Check for remember me checkbox and click it if it exists
  const rememberCheckbox = page.locator('input[name="remember"]');
  if (await rememberCheckbox.isVisible()) {
    await rememberCheckbox.check();
  }
  
  // Create a navigation promise before submission
  const navigationPromise = page.waitForNavigation({ timeout: 10000 })
    .catch(e => console.log('Navigation timeout or no navigation occurred'));
  
  // Click login button using a more reliable selector
  const submitButton = page.locator('button[type="submit"]');
  await expect(submitButton).toBeVisible();
  await submitButton.click();
  
  // Wait for navigation to complete
  await navigationPromise;
  await page.waitForLoadState('networkidle');
  
  // Check if we're logged in
  console.log('After login URL:', page.url());
  await page.screenshot({ path: 'auth-test-after-login.png' });
  
  // Check for authenticated state - look for signs of successful login
  const isLoggedIn = await page.evaluate(() => {
    // Check for dashboard elements or logout button that would indicate logged in state
    const hasLogoutButton = Boolean(document.querySelector('a[href*="logout"]'));
    const hasAdminHeader = Boolean(document.querySelector('header')?.textContent?.includes('Admin'));
    const isProductPage = window.location.pathname.includes('/productsearch');
    
    return {
      url: window.location.href,
      isProductPage,
      hasLogoutButton,
      hasAdminHeader,
      bodyText: document.body.textContent?.substring(0, 200) // Include just a sample of text
    };
  });
  console.log('Login state:', isLoggedIn);
  
  // Verify redirection to expected page after login
  expect(page.url()).not.toContain('/adminlogin');
  
  // Assert that we are logged in - use multiple conditions
  expect(
    isLoggedIn.isProductPage || 
    isLoggedIn.hasLogoutButton || 
    isLoggedIn.hasAdminHeader
  ).toBeTruthy('Login verification failed - not properly authenticated');
});

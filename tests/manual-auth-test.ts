import { chromium } from '@playwright/test';

async function testAuth() {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
        console.log('Navigating to login page...');
        await page.goto('/login');
        
        console.log('Current URL:', page.url());
        
        // Try to login
        console.log('Filling login form...');
        await page.fill('input[name="email"]', 'admin@example.com');
        await page.fill('input[name="password"]', 'password');
        
        console.log('Submitting login form...');
        await page.click('button[type="submit"]');
        
        // Wait for navigation
        await page.waitForLoadState('networkidle');
        
        console.log('After login URL:', page.url());
        console.log('Page title:', await page.title());
        
        // Check if we're logged in
        const content = await page.content();
        console.log('Login success indicators present:', 
            !content.includes('form action="/login"') && 
            (content.includes('Dashboard') || content.includes('Logout')));
            
        // Wait for user to see the result
        await new Promise(resolve => setTimeout(resolve, 5000));
    } catch (error) {
        console.error('Auth test failed:', error);
    } finally {
        await browser.close();
    }
}

testAuth().catch(console.error);

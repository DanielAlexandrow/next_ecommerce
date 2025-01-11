import { test, expect } from '@playwright/test';

test('debug test', async ({ page }) => {
    console.log('Starting test...');

    try {
        // Enable request logging
        page.on('request', request => {
            console.log(`>> ${request.method()} ${request.url()}`);
        });
        page.on('response', response => {
            console.log(`<< ${response.status()} ${response.url()}`);
        });

        console.log('Navigating to login page...');
        const response = await page.goto('/login');
        console.log('Navigation complete');
        console.log('Response status:', response?.status());
        console.log('Response headers:', await response?.allHeaders());

        // Take a screenshot
        await page.screenshot({ path: 'debug-screenshot.png' });

        // Get page content
        const content = await page.content();
        console.log('Page content length:', content.length);
        console.log('Page title:', await page.title());

        console.log('Test completed successfully');
    } catch (error) {
        console.error('Test failed:', error);
        throw error;
    }
}); 
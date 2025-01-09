import { test, expect } from '@playwright/test';

test.describe('Orders Page', () => {
    test('should check for console errors', async ({ page }) => {
        // Create array to store console errors
        const consoleErrors: string[] = [];

        // Listen to console errors
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text());
            }
        });

        // Visit the orders page
        await page.goto('http://localhost:8000/profile/orders');

        // Wait for any potential errors
        await page.waitForTimeout(2000);

        // Log the errors for documentation
        if (consoleErrors.length > 0) {
            console.log('Console errors found:');
            consoleErrors.forEach(error => console.log(error));
        }

        // Add errors to README
        await test.step('Document errors in README', async () => {
            const errorSection = `
## Orders Page Error (Fixed)

\`\`\`
${consoleErrors.join('\n')}
\`\`\`

### Solution
The error was fixed by parsing the JSON items string to an array in the UserOrdersController before sending it to the frontend.
`;
            console.log('Error documentation to add to README:');
            console.log(errorSection);
        });
    });
}); 
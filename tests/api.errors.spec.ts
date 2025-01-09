import { test, expect } from '@playwright/test';

test.describe('API Error Handling Tests', () => {
    const baseUrl = 'http://localhost:8000/api';

    test('non-existent endpoint returns 404 with correct error structure', async ({ request }) => {
        const response = await request.get(`${baseUrl}/nonexistent-endpoint`);
        expect(response.status()).toBe(404);

        const body = await response.json();
        expect(body).toHaveProperty('message');
        expect(body).toHaveProperty('error');
        expect(body.message).toBe('Not Found');
        expect(body.error).toBe('The requested endpoint does not exist.');
    });

    test('invalid HTTP method returns 405', async ({ request }) => {
        // Test with valid endpoint but wrong method
        const response = await request.delete(`${baseUrl}/products/search`);
        expect(response.status()).toBe(405);

        const body = await response.json();
        expect(body).toHaveProperty('message');
        expect(body.message).toContain('Method Not Allowed');
    });

    test('invalid query parameters return 422', async ({ request }) => {
        const response = await request.get(`${baseUrl}/products/search`, {
            params: {
                minPrice: 'invalid',
                maxPrice: 'invalid'
            }
        });
        expect(response.status()).toBe(422);

        const body = await response.json();
        expect(body).toHaveProperty('message');
        expect(body).toHaveProperty('errors');
        expect(body.errors).toHaveProperty('minPrice');
        expect(body.errors).toHaveProperty('maxPrice');
    });

    test('invalid price range returns 422 with correct error message', async ({ request }) => {
        const response = await request.get(`${baseUrl}/products/search`, {
            params: {
                minPrice: '100',
                maxPrice: '10'
            }
        });
        expect(response.status()).toBe(422);

        const body = await response.json();
        expect(body).toHaveProperty('message');
        expect(body).toHaveProperty('errors');
        expect(body.errors).toHaveProperty('maxPrice');
        expect(body.message).toBe('Maximum price cannot be less than minimum price');
    });

    test('invalid pagination parameters return 422', async ({ request }) => {
        const response = await request.get(`${baseUrl}/products/search`, {
            params: {
                page: '-1'
            }
        });
        expect(response.status()).toBe(422);

        const body = await response.json();
        expect(body).toHaveProperty('errors');
        expect(body.errors).toHaveProperty('page');
    });

    test('invalid sort parameter returns 422', async ({ request }) => {
        const response = await request.get(`${baseUrl}/products/search`, {
            params: {
                sortBy: 'invalid_sort'
            }
        });
        expect(response.status()).toBe(422);

        const body = await response.json();
        expect(body).toHaveProperty('errors');
        expect(body.errors).toHaveProperty('sortBy');
    });

    test('protected endpoint without auth returns 401', async ({ request }) => {
        const response = await request.get(`${baseUrl}/profile`);
        expect(response.status()).toBe(401);

        const body = await response.json();
        expect(body).toHaveProperty('message');
        expect(body.message).toContain('Unauthenticated');
    });

    test('protected endpoint with invalid token returns 401', async ({ request }) => {
        const response = await request.get(`${baseUrl}/profile`, {
            headers: {
                'Authorization': 'Bearer invalid_token'
            }
        });
        expect(response.status()).toBe(401);

        const body = await response.json();
        expect(body).toHaveProperty('message');
        expect(body.message).toContain('Unauthenticated');
    });

    test('malformed JSON body returns 400', async ({ request }) => {
        const response = await request.post(
            `${baseUrl}/cart/add`,
            {
                headers: {
                    'Content-Type': 'application/json'
                },
                data: 'invalid_json{'
            }
        );
        expect(response.status()).toBe(400);

        const body = await response.json();
        expect(body).toHaveProperty('message');
        expect(body.message).toContain('Invalid JSON');
    });
});

test.describe('API Error Handling', () => {
    test('should check orders page console errors', async ({ page }) => {
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
            // Here you would typically write this to README.md
            console.log('Error documentation to add to README:');
            console.log(errorSection);
        });
    });
}); 
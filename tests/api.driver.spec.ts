import { test, expect } from '@playwright/test';

test.describe('Driver API Tests', () => {
    const baseUrl = 'http://localhost:8000';
    let authCookie: string;
    let csrfToken: string;

    test.beforeAll(async ({ request }) => {
        // Get CSRF token
        const response = await request.get(`${baseUrl}/login`);
        const html = await response.text();
        const match = html.match(/<meta name="csrf-token" content="([^"]+)"/);
        csrfToken = match ? match[1] : '';

        // Login as driver
        const loginResponse = await request.post(`${baseUrl}/login`, {
            data: {
                email: 'driver@example.com',
                password: 'password',
            },
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            }
        });

        // Get auth cookie
        const cookieHeader = loginResponse.headers()['set-cookie'];
        const cookies = typeof cookieHeader === 'string' ? [cookieHeader] : cookieHeader || [];
        const sessionCookie = cookies.find(cookie => cookie.startsWith('laravel_session='));
        if (sessionCookie) {
            authCookie = sessionCookie.split(';')[0];
        }
    });

    // Driver Coordinates Tests
    test('driver can manage their coordinates', async ({ request }) => {
        // Store coordinates
        const storeResponse = await request.post(`${baseUrl}/driver/coordinates`, {
            data: {
                latitude: 40.7128,
                longitude: -74.0060
            },
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Cookie': authCookie
            }
        });
        expect(storeResponse.status()).toBe(200);

        // Get current coordinates
        const getResponse = await request.get(`${baseUrl}/driver/coordinates/current`, {
            headers: {
                'Cookie': authCookie
            }
        });
        expect(getResponse.status()).toBe(200);
        const coordinates = await getResponse.json();
        expect(coordinates).toHaveProperty('latitude');
        expect(coordinates).toHaveProperty('longitude');

        // Update coordinates
        const updateResponse = await request.put(`${baseUrl}/driver/coordinates`, {
            data: {
                latitude: 34.0522,
                longitude: -118.2437
            },
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Cookie': authCookie
            }
        });
        expect(updateResponse.status()).toBe(200);
    });

    // Driver Orders Tests
    test('driver can view assigned orders', async ({ request }) => {
        const response = await request.get(`${baseUrl}/driver/orders`, {
            headers: {
                'Cookie': authCookie
            }
        });
        expect(response.status()).toBe(200);
        const orders = await response.json();
        expect(Array.isArray(orders)).toBeTruthy();
    });

    // Invalid Coordinates Tests
    test('driver cannot submit invalid coordinates', async ({ request }) => {
        // Test with invalid latitude
        const invalidLatResponse = await request.post(`${baseUrl}/driver/coordinates`, {
            data: {
                latitude: 91, // Invalid latitude (> 90)
                longitude: -74.0060
            },
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Cookie': authCookie
            }
        });
        expect(invalidLatResponse.status()).toBe(422);

        // Test with invalid longitude
        const invalidLonResponse = await request.post(`${baseUrl}/driver/coordinates`, {
            data: {
                latitude: 40.7128,
                longitude: 181 // Invalid longitude (> 180)
            },
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Cookie': authCookie
            }
        });
        expect(invalidLonResponse.status()).toBe(422);

        // Test with missing coordinates
        const missingCoordsResponse = await request.post(`${baseUrl}/driver/coordinates`, {
            data: {},
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Cookie': authCookie
            }
        });
        expect(missingCoordsResponse.status()).toBe(422);
    });

    // Authorization Tests
    test('non-driver user cannot access driver endpoints', async ({ request }) => {
        // Login as regular user
        const regularUserLogin = await request.post(`${baseUrl}/login`, {
            data: {
                email: 'user@example.com',
                password: 'password',
            },
            headers: {
                'X-CSRF-TOKEN': csrfToken,
            }
        });

        // Get auth cookie for regular user
        const cookieHeader = regularUserLogin.headers()['set-cookie'];
        const cookies = typeof cookieHeader === 'string' ? [cookieHeader] : cookieHeader || [];
        const sessionCookie = cookies.find(cookie => cookie.startsWith('laravel_session='));
        const regularUserAuthCookie = sessionCookie ? sessionCookie.split(';')[0] : '';

        // Try to access driver endpoint
        const response = await request.get(`${baseUrl}/driver/coordinates`, {
            headers: {
                'Cookie': regularUserAuthCookie
            }
        });
        expect(response.status()).toBe(403);
    });
}); 
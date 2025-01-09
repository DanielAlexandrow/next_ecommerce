import { test, expect } from '@playwright/test';

test.describe('User API Tests', () => {
    const baseUrl = 'http://localhost:8000/api';
    let authToken: string;

    test.beforeAll(async ({ request }) => {
        // Register a new user
        const registerResponse = await request.post(`${baseUrl}/register`, {
            data: {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password',
                password_confirmation: 'password'
            }
        });
        expect(registerResponse.status()).toBe(201);

        // Login with the new user
        const loginResponse = await request.post(`${baseUrl}/login`, {
            data: {
                email: 'test@example.com',
                password: 'password'
            }
        });
        const body = await loginResponse.json();
        authToken = body.token;
    });

    // Authentication Tests
    test('user can login with valid credentials', async ({ request }) => {
        const response = await request.post(`${baseUrl}/login`, {
            data: {
                email: 'test@example.com',
                password: 'password'
            }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('token');
    });

    test('user cannot login with invalid credentials', async ({ request }) => {
        const response = await request.post(`${baseUrl}/login`, {
            data: {
                email: 'test@example.com',
                password: 'wrongpassword'
            }
        });
        expect(response.status()).toBe(401);
    });

    test('user can request password reset', async ({ request }) => {
        const response = await request.post(`${baseUrl}/forgot-password`, {
            data: {
                email: 'test@example.com'
            }
        });
        expect(response.status()).toBe(200);
    });

    // Profile Management Tests
    test('user can view their profile', async ({ request }) => {
        const response = await request.get(`${baseUrl}/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('name');
        expect(body).toHaveProperty('email');
    });

    test('user can update their profile', async ({ request }) => {
        const response = await request.put(`${baseUrl}/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                name: 'Updated Name'
            }
        });
        expect(response.status()).toBe(200);
    });

    test('user can change password', async ({ request }) => {
        const response = await request.put(`${baseUrl}/password`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                current_password: 'password',
                password: 'newpassword',
                password_confirmation: 'newpassword'
            }
        });
        expect(response.status()).toBe(200);
    });

    // Address Management Tests
    test('user can add shipping address', async ({ request }) => {
        const response = await request.post(`${baseUrl}/addresses`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                street: '123 Test St',
                city: 'Test City',
                state: 'TS',
                postal_code: '12345',
                country: 'Test Country'
            }
        });
        expect(response.status()).toBe(201);
    });

    test('user can view their addresses', async ({ request }) => {
        const response = await request.get(`${baseUrl}/addresses`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBeTruthy();
    });

    // Order Tests
    test('user can view their orders', async ({ request }) => {
        const response = await request.get(`${baseUrl}/orders`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBeTruthy();
    });

    test('user can create an order', async ({ request }) => {
        const response = await request.post(`${baseUrl}/orders`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                items: [
                    {
                        product_id: 1,
                        quantity: 2
                    }
                ],
                shipping_address_id: 1
            }
        });
        expect(response.status()).toBe(201);
    });

    test('user can view order details', async ({ request }) => {
        const orderId = 1;
        const response = await request.get(`${baseUrl}/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty('items');
        expect(body).toHaveProperty('total');
        expect(body).toHaveProperty('status');
    });

    // Review Tests
    test('user can add product review', async ({ request }) => {
        const productId = 1;
        const response = await request.post(`${baseUrl}/products/${productId}/reviews`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            data: {
                rating: 5,
                comment: 'Great product!'
            }
        });
        expect(response.status()).toBe(201);
    });

    test('user can view their reviews', async ({ request }) => {
        const response = await request.get(`${baseUrl}/reviews`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(Array.isArray(body)).toBeTruthy();
    });
}); 
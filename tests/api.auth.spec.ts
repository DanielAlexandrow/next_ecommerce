import { test, expect } from '@playwright/test';

test.describe('Authenticated API Tests', () => {
    const baseUrl = 'http://localhost:8000';
    let authCookie: string;
    let csrfToken: string;

    test.beforeAll(async ({ request }) => {
        // Get CSRF token
        const response = await request.get(`${baseUrl}/login`);
        const html = await response.text();
        const match = html.match(/<meta name="csrf-token" content="([^"]+)"/);
        csrfToken = match ? match[1] : '';

        // Login
        const loginResponse = await request.post(`${baseUrl}/login`, {
            data: {
                email: 'admin@example.com',
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

    // Admin Product Management Tests
    test('admin can create and manage products', async ({ request }) => {
        // Create product
        const createResponse = await request.post(`${baseUrl}/products`, {
            data: {
                name: 'Test Product',
                description: 'Test Description',
                price: 99.99,
                category_id: 1
            },
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Cookie': authCookie
            }
        });
        expect(createResponse.status()).toBe(200);
        const product = await createResponse.json();
        expect(product).toHaveProperty('id');

        // Get product
        const getResponse = await request.get(`${baseUrl}/products/${product.id}`, {
            headers: {
                'Cookie': authCookie
            }
        });
        expect(getResponse.status()).toBe(200);
        const retrievedProduct = await getResponse.json();
        expect(retrievedProduct.name).toBe('Test Product');

        // Update product
        const updateResponse = await request.put(`${baseUrl}/products/${product.id}`, {
            data: {
                name: 'Updated Product',
                description: 'Updated Description',
                price: 149.99
            },
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Cookie': authCookie
            }
        });
        expect(updateResponse.status()).toBe(200);

        // Delete product
        const deleteResponse = await request.delete(`${baseUrl}/products/${product.id}`, {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Cookie': authCookie
            }
        });
        expect(deleteResponse.status()).toBe(200);
    });

    // Category Management Tests
    test('admin can manage categories', async ({ request }) => {
        // Create category
        const createResponse = await request.post(`${baseUrl}/categories`, {
            data: {
                name: 'Test Category',
                description: 'Test Category Description'
            },
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Cookie': authCookie
            }
        });
        expect(createResponse.status()).toBe(200);
        const category = await createResponse.json();

        // Get categories
        const getResponse = await request.get(`${baseUrl}/categories`, {
            headers: {
                'Cookie': authCookie
            }
        });
        expect(getResponse.status()).toBe(200);
        const categories = await getResponse.json();
        expect(Array.isArray(categories)).toBeTruthy();

        // Delete category
        const deleteResponse = await request.delete(`${baseUrl}/categories/${category.id}`, {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Cookie': authCookie
            }
        });
        expect(deleteResponse.status()).toBe(200);
    });

    // Order Management Tests
    test('admin can view orders', async ({ request }) => {
        const response = await request.get(`${baseUrl}/orders`, {
            headers: {
                'Cookie': authCookie
            }
        });
        expect(response.status()).toBe(200);
        const orders = await response.json();
        expect(orders).toHaveProperty('data');
        expect(Array.isArray(orders.data)).toBeTruthy();
    });

    // Brand Management Tests
    test('admin can manage brands', async ({ request }) => {
        // Create brand
        const createResponse = await request.post(`${baseUrl}/brands`, {
            data: {
                name: 'Test Brand'
            },
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Cookie': authCookie
            }
        });
        expect(createResponse.status()).toBe(200);
        const brand = await createResponse.json();

        // Get all brands
        const getResponse = await request.get(`${baseUrl}/brands/getallbrands`, {
            headers: {
                'Cookie': authCookie
            }
        });
        expect(getResponse.status()).toBe(200);
        const brands = await getResponse.json();
        expect(Array.isArray(brands)).toBeTruthy();

        // Delete brand
        const deleteResponse = await request.delete(`${baseUrl}/brands/${brand.id}`, {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Cookie': authCookie
            }
        });
        expect(deleteResponse.status()).toBe(200);
    });

    // Shop Settings Tests
    test('admin can manage shop settings', async ({ request }) => {
        const updateResponse = await request.post(`${baseUrl}/api/shop-settings`, {
            data: {
                shop_name: 'Test Shop',
                contact_email: 'test@example.com'
            },
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'Cookie': authCookie
            }
        });
        expect(updateResponse.status()).toBe(200);
    });
}); 
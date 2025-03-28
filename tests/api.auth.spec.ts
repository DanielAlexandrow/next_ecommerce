import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    test.beforeAll(async () => {
        console.log('🔐 Starting Authentication test suite');
        console.log('💫 Environment:', process.env.NODE_ENV);
        console.log('🔄 Setting up test database');
    });

    test.afterAll(async () => {
        console.log('🏁 Completed Authentication test suite');
        console.log('🧹 Cleaning up test data');
    });

    test.beforeEach(async () => {
        console.log('\n📝 Starting new auth test case');
        console.log('🔄 Resetting session state');
    });

    test('should login successfully', async ({ request }) => {
        console.log('🎯 Testing login endpoint');
        const credentials = {
            email: 'test@example.com',
            password: 'password123'
        };
        console.log('🔑 Attempting login with:', credentials.email);

        const response = await request.post('/api/login', {
            data: credentials
        });
        console.log('📊 Login response status:', response.status());
        
        const data = await response.json();
        console.log('🎫 Token received:', data.token ? 'Yes' : 'No');
        
        expect(response.ok()).toBeTruthy();
        expect(data.token).toBeDefined();
        console.log('✅ Login successful');
    });

    test('should handle invalid credentials', async ({ request }) => {
        console.log('🎯 Testing invalid login');
        const invalidCredentials = {
            email: 'wrong@example.com',
            password: 'wrongpass'
        };
        console.log('⚠️ Testing with invalid credentials');

        const response = await request.post('/api/login', {
            data: invalidCredentials
        });
        console.log('📊 Response status:', response.status());
        console.log('❌ Error response:', await response.text());
        
        expect(response.status()).toBe(401);
        console.log('✅ Invalid credentials handled correctly');
    });

    test('should protect authenticated routes', async ({ request }) => {
        console.log('🎯 Testing protected route access');
        console.log('🚫 Attempting access without token');

        const response = await request.get('/api/profile');
        console.log('📊 Response status:', response.status());
        
        expect(response.status()).toBe(401);
        console.log('✅ Protected route properly secured');
    });
});
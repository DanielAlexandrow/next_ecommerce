import { APIRequestContext } from '@playwright/test';

export async function getAuthData(request, email, password) {
    const baseUrl = 'http://localhost:8000';

    // Get CSRF token
    const response = await request.get(`${baseUrl}/login`);
    const html = await response.text();
    const match = html.match(/<meta name="csrf-token" content="([^"]+)"/);
    const csrfToken = match ? match[1] : '';

    // Login
    const loginResponse = await request.post(`${baseUrl}/login`, {
        data: { email, password },
        headers: { 'X-CSRF-TOKEN': csrfToken }
    });

    // Get auth cookie
    const cookieHeader = loginResponse.headers()['set-cookie'];
    const cookies = typeof cookieHeader === 'string' ? [cookieHeader] : cookieHeader || [];
    const sessionCookie = cookies.find(cookie => cookie.startsWith('laravel_session='));
    const authCookie = sessionCookie ? sessionCookie.split(';')[0] : '';

    return { csrfToken, authCookie };
}

export function getAuthHeaders(authData, includeCsrf = true) {
    const headers: Record<string, string> = {
        'Cookie': authData.authCookie
    };

    if (includeCsrf) {
        headers['X-CSRF-TOKEN'] = authData.csrfToken;
    }

    return headers;
}

export const TEST_USERS = {
    admin: {
        email: 'admin@example.com',
        password: 'password'
    },
    driver: {
        email: 'driver@example.com',
        password: 'password'
    },
    user: {
        email: 'user@example.com',
        password: 'password'
    }
} as const; 

import { test, expect } from '@playwright/test';

test('server is reachable', async ({ request }) => {
    console.log('Starting ping test...');

    try {
        // Try to reach the server
        const response = await request.get('http://localhost:8000');
        console.log('Response status:', response.status());

        // Log headers
        const headers = response.headers();
        console.log('Response headers:', headers);

        // Log response text
        const text = await response.text();
        console.log('Response length:', text.length);

        // Basic assertions
        expect(response.ok()).toBeTruthy();
        expect(text).toContain('<!DOCTYPE html>');
    } catch (error) {
        console.error('Test failed:', error);
        throw error;
    }
}); 
import { test, expect } from '@playwright/test';

test('server is responding', async ({ request }) => {
    // Make a simple GET request to the server
    const response = await request.get('/');

    // Check if we get a response
    expect(response.ok()).toBeTruthy();

    // Verify we get some HTML back
    const text = await response.text();
    expect(text).toContain('<!DOCTYPE html>');
}); 
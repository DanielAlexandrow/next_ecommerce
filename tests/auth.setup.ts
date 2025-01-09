import { chromium, FullConfig } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function globalSetup(config: FullConfig) {
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();

    // Get CSRF token
    await page.goto('http://localhost:8000/login');
    const csrfToken = await page.evaluate(() => {
        const el = document.querySelector('meta[name="csrf-token"]');
        return el?.getAttribute('content') || '';
    });

    // Login
    await page.request.post('http://localhost:8000/login', {
        form: {
            email: 'admin@example.com',
            password: 'password123',
            _token: csrfToken,
        },
        headers: {
            'Accept': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
        },
    });

    // Save storage state
    const authDir = path.join(process.cwd(), 'playwright/.auth');
    if (!fs.existsSync(authDir)) {
        fs.mkdirSync(authDir, { recursive: true });
    }
    await context.storageState({ path: path.join(authDir, 'admin.json') });

    await browser.close();
}

export default globalSetup; 
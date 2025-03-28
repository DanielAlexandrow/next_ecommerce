import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';
import { initTestHistory } from '@/tests/test-history';
import axios from 'axios';

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', mockResizeObserver);

// Configure axios for tests
axios.defaults.baseURL = '';

// Mock axios adapter to prevent actual HTTP requests
vi.mock('axios');

// Initialize test history tracking
beforeAll(() => {
    initTestHistory();
});

// Cleanup after each test
afterEach(() => {
    cleanup();
});
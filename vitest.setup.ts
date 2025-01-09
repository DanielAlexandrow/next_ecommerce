import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';
import { initTestHistory } from './resources/js/tests/test-history';

// Mock ResizeObserver
const mockResizeObserver = vi.fn(() => ({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', mockResizeObserver);

// Initialize test history tracking
beforeAll(() => {
    initTestHistory();
});

// Cleanup after each test
afterEach(() => {
    cleanup();
}); 
import '@testing-library/jest-dom';

// Mock IntersectionObserver
class IntersectionObserver {
    observe = jest.fn()
    disconnect = jest.fn()
    unobserve = jest.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserver
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock ResizeObserver
class ResizeObserver {
    observe = jest.fn()
    disconnect = jest.fn()
    unobserve = jest.fn()
}

Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserver
});

// Suppress console errors during tests
console.error = jest.fn();

// Add any other global mocks or setup here 